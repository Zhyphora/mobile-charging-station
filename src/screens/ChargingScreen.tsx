import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  NativeModules,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "../components/ProgressBar";
import ButtonCard from "../components/ButtonCard";
// QRISModal removed; we'll inline scanner logic to attach billing to account
import { validatePayment } from "../services/payments";
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
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [manualAmount, setManualAmount] = React.useState("");

  const { setBilling, markPaid } = useVehicle();

  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
        setProgress((p) => {
          const next = Math.min(1, p + 0.01);
          // when charging completes, show post-charge flow once
          if (next >= 1) {
            setShowPostCharge(true);
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

  // scanner flow is handled by ScannerModal component

  const stop = () => {
    setRunning(false);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Charging</Text>
        <Text style={styles.desc}>
          Status: {running ? "Berjalan" : "Berhenti"}
        </Text>

        <View style={{ width: "100%", marginVertical: 24 }}>
          <ProgressBar
            progress={progress}
            height={14}
            color="#06b6d4"
            borderRadius={8}
          />
          <Text style={styles.timerText}>{`${minutes}m ${secs}s`}</Text>
        </View>

        <ButtonCard
          title={
            running
              ? "Stop Charging"
              : progress >= 1
              ? "Reset & Start"
              : "Start Charging"
          }
          subtitle={
            running
              ? "Charging in progress"
              : "Tap to scan QR code before charging"
          }
          onPress={toggle}
          style={{ marginTop: 18, width: "100%" }}
        />

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
              <Text style={{ fontWeight: "700", fontSize: 18 }}>
                Charging Complete
              </Text>
              <Text style={{ color: "#64748b", marginTop: 8 }}>
                Pilih metode pembayaran:
              </Text>

              {!showManualEntry ? (
                <View style={{ marginTop: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: "#06b6d4", marginBottom: 10 },
                    ]}
                    onPress={() => {
                      setShowPostCharge(false);
                      setShowScanner(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Scan to Pay (QRIS)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#fb923c" }]}
                    onPress={() => setShowManualEntry(true)}
                  >
                    <Text style={styles.buttonText}>
                      Enter Billing Manually
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <TextInput
                    value={manualAmount}
                    onChangeText={(text) => {
                      // accept digits only, remove non-digits
                      const digits = text.replace(/[^0-9]/g, "");
                      setManualAmount(digits);
                    }}
                    placeholder="50000"
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  />
                  <Text style={{ marginBottom: 8, color: "#374151" }}>
                    Preview:{" "}
                    {manualAmount ? formatRupiah(manualAmount) : "Rp 0"}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: "#16a34a",
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
                    <Text style={styles.buttonText}>Save Billing</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={{ marginTop: 12 }}
                onPress={() => setShowPostCharge(false)}
              >
                <Text style={{ color: "#0f172a" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  desc: { color: "#475569", marginBottom: 20, textAlign: "center" },
  timerText: {
    marginTop: 12,
    textAlign: "center",
    color: "#334155",
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    width: "90%",
  },
});

export default ChargingScreen;
