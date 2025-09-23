import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "../components/ProgressBar";
import ButtonCard from "../components/ButtonCard";
import ScannerModal from "../components/ScannerModal";
import useVehicle from "../hooks/useVehicle";

const ChargingScreen: React.FC = () => {
  // format numeric string to Indonesian Rupiah display, e.g. "50000" -> "Rp 50.000"
  function formatRupiah(digits: string) {
    const n = parseInt(digits || "0", 10) || 0;
    return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function isValidAmount(digits: string) {
    const n = parseInt(digits || "0", 10) || 0;
    return n > 0;
  }

  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0..1
  const [seconds, setSeconds] = React.useState(0);
  const [showScanner, setShowScanner] = React.useState(false);
  const [showPostCharge, setShowPostCharge] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [manualAmount, setManualAmount] = React.useState("");

  const { setBilling, markPaid } = useVehicle();
  const { billing } = useVehicle();

  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
        setProgress((p) => {
          const next = Math.min(1, p + 0.01);
          // when charging completes, show post-charge flow once
          if (next >= 1) {
            // mark charging finished and show success modal
            setShowPostCharge(true);
            setShowSuccess(true);
            setRunning(false);
          }
          return next;
        });
      }, 1000) as unknown as number;
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
      }
    };
  }, [running]);

  const toggle = () => {
    // If finished, reset and require fresh payment
    if (progress >= 1) {
      setProgress(0);
      setSeconds(0);
      setRunning(false);
      setShowPostCharge(true);
      return;
    }
    // require QRIS scan before starting if currently stopped
    if (!running) {
      // open scanner modal
      setShowScanner(true);
      return;
    }
    setRunning((r) => !r);
  };

  const stop = () => {
    setRunning(false);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progressPercentage = Math.round(progress * 100);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Charging Station</Text>
            <Text style={styles.subtitle}>
              Monitor your electric vehicle charging progress
            </Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: running
                        ? "#22c55e"
                        : progress >= 1
                        ? "#3b82f6"
                        : "#64748b",
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {running
                    ? "Charging"
                    : progress >= 1
                    ? "Completed"
                    : "Ready to Charge"}
                </Text>
              </View>
              {running && (
                <TouchableOpacity style={styles.stopButton} onPress={stop}>
                  <Ionicons name="stop" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Battery Level</Text>
                <Text style={styles.progressValue}>{progressPercentage}%</Text>
              </View>

              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={progress}
                  height={12}
                  color={
                    progress >= 1 ? "#22c55e" : running ? "#3b82f6" : "#e2e8f0"
                  }
                  borderRadius={6}
                />
              </View>

              {/* Time Display */}
              <View style={styles.timeDisplay}>
                <View style={styles.timeItem}>
                  <Ionicons name="time-outline" size={20} color="#64748b" />
                  <Text style={styles.timeLabel}>Duration</Text>
                  <Text style={styles.timeValue}>
                    {minutes.toString().padStart(2, "0")}:
                    {secs.toString().padStart(2, "0")}
                  </Text>
                </View>

                {progress > 0 && (
                  <View style={styles.timeItem}>
                    <Ionicons
                      name="battery-charging"
                      size={20}
                      color="#64748b"
                    />
                    <Text style={styles.timeLabel}>Est. Remaining</Text>
                    <Text style={styles.timeValue}>
                      {running
                        ? `${Math.round((1 - progress) * 100)}min`
                        : "---"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: running
                    ? "#ef4444"
                    : progress >= 1
                    ? "#3b82f6"
                    : "#22c55e",
                },
              ]}
              onPress={toggle}
              activeOpacity={0.85}
            >
              <Ionicons
                name={running ? "pause" : progress >= 1 ? "refresh" : "play"}
                size={24}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {running
                  ? "Pause Charging"
                  : progress >= 1
                  ? "Start New Session"
                  : "Start Charging"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.actionHint}>
              {!running && progress < 1 && "Scan QR code to begin charging"}
              {running && "Charging in progress..."}
              {progress >= 1 && "Ready for next session"}
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="flash" size={24} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Power Output</Text>
                <Text style={styles.infoValue}>
                  {running ? "22 kW" : "0 kW"}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="speedometer" size={24} color="#8b5cf6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Charging Speed</Text>
                <Text style={styles.infoValue}>{running ? "Fast" : "---"}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <ScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onSuccess={(res) => {
          // format amount and attach to account, then start charging
          const amount = res.data?.amount || 0;
          setBilling({
            amount: formatRupiah(String(amount)),
            due: new Date().toLocaleDateString(),
          });
          markPaid();
          setShowScanner(false);
          setRunning(true);
        }}
      />

      {/* Post-charge modal: show two CTAs */}
      <Modal
        visible={showPostCharge}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPostCharge(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={styles.modalTitle}>Charging Complete!</Text>
              <Text style={styles.modalSubtitle}>
                Choose your payment method
              </Text>
            </View>

            {!showManualEntry ? (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setShowPostCharge(false);
                    setShowScanner(true);
                  }}
                >
                  <Ionicons name="qr-code" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Scan to Pay (QRIS)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.secondaryButton]}
                  onPress={() => setShowManualEntry(true)}
                >
                  <Ionicons name="card" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Enter Manually</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.manualEntry}>
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <TextInput
                  value={manualAmount}
                  onChangeText={(text) => {
                    // accept digits only, remove non-digits
                    const digits = text.replace(/[^0-9]/g, "");
                    setManualAmount(digits);
                  }}
                  placeholder="50000"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text style={styles.preview}>
                  Preview: {manualAmount ? formatRupiah(manualAmount) : "Rp 0"}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    {
                      opacity: isValidAmount(manualAmount) ? 1 : 0.5,
                    },
                  ]}
                  disabled={!isValidAmount(manualAmount)}
                  onPress={() => {
                    // set billing and close
                    setBilling({
                      amount: formatRupiah(manualAmount),
                      due: "--",
                    });
                    setShowManualEntry(false);
                    setShowPostCharge(false);
                  }}
                >
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Save Billing</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowPostCharge(false);
                setShowManualEntry(false);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success modal shown when charging finishes */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.successModal]}>
            <Ionicons name="battery-full" size={64} color="#22c55e" />
            <Text style={styles.successTitle}>Battery Fully Charged! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Your billing has been added to your account
            </Text>

            <View style={styles.billingInfo}>
              <Text style={styles.billingAmount}>
                {billing?.amount || "Rp 0"}
              </Text>
              <Text style={styles.billingDue}>
                Due Date: {billing?.due || "--"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.successButton]}
              onPress={() => {
                setShowSuccess(false);
                setShowPostCharge(false);
              }}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollView: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 120, // Space for floating tab bar
  },

  // Header Styles
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },

  // Status Card
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  stopButton: {
    backgroundColor: "#ef4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  progressSection: {
    marginBottom: 8,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  progressLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },

  progressValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  progressContainer: {
    marginBottom: 20,
  },

  timeDisplay: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  timeItem: {
    alignItems: "center",
    flex: 1,
  },

  timeLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 4,
  },

  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  // Action Section
  actionSection: {
    alignItems: "center",
    marginBottom: 32,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  actionHint: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },

  // Info Section
  infoSection: {
    flexDirection: "row",
    gap: 16,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },

  modalActions: {
    gap: 12,
    marginBottom: 16,
  },

  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
  },

  secondaryButton: {
    backgroundColor: "#fb923c",
  },

  saveButton: {
    backgroundColor: "#22c55e",
    marginTop: 12,
  },

  manualEntry: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },

  preview: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },

  closeButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  closeButtonText: {
    color: "#6b7280",
    fontWeight: "600",
  },

  // Success Modal
  successModal: {
    alignItems: "center",
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },

  successSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },

  billingInfo: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: "100%",
  },

  billingAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#22c55e",
    marginBottom: 4,
  },

  billingDue: {
    fontSize: 14,
    color: "#64748b",
  },

  successButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    minWidth: 120,
  },
});

export default ChargingScreen;
