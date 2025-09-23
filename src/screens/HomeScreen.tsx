import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Modal, RefreshControl } from "react-native";
import BatteryUsageChart from "../components/BatteryUsageChart";
import useVehicle from "../hooks/useVehicle";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const navigation: any = useNavigation();

  // vehicle state (from device / simulation hook)
  const {
    odometer,
    mode,
    batteryPercent,
    batteryRange,
    temps,
    billing,
    setMode: setModeFromVehicle,
    markPaid,
  } = useVehicle();
  const [showPayModal, setShowPayModal] = React.useState<boolean>(false);

  // helper to pick color based on status text
  function colorFor(status: string) {
    const s = (status || "").toLowerCase();
    if (s.includes("normal") || s.includes("ok")) return "#10b981"; // emerald-500
    if (s.includes("high") || s.includes("over")) return "#ef4444"; // red-500
    return "#6b7280"; // gray-500
  }

  const onStartCharging = () => navigation.navigate("Charge");

  // battery history for usage chart (sample recent values)
  const [batteryHistory, setBatteryHistory] = React.useState<
    { t: number; pct: number; odo: number }[]
  >(() => [{ t: Date.now(), pct: batteryPercent, odo: odometer }]);

  // animated value for battery fill
  const batteryAnim = React.useRef(new Animated.Value(batteryPercent)).current;

  React.useEffect(() => {
    // animate battery fill when batteryPercent changes
    Animated.timing(batteryAnim, {
      toValue: batteryPercent,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [batteryPercent, batteryAnim]);

  // confirm modal for Charge Now CTA
  const [showChargeConfirm, setShowChargeConfirm] = React.useState(false);

  // tooltip state for chart bars
  const [tooltipEntry, setTooltipEntry] = React.useState<{
    t: number;
    pct: number;
    odo: number;
  } | null>(null);

  // pull-to-refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // animated values for chart bars
  const barAnimsRef = React.useRef<Animated.Value[]>([]);

  React.useEffect(() => {
    // push latest sample into history, keep last 12 samples
    setBatteryHistory((h) => {
      const next = [
        ...h.slice(-11),
        { t: Date.now(), pct: batteryPercent, odo: odometer },
      ];
      barAnimsRef.current = next.map(
        (entry, i) => barAnimsRef.current[i] || new Animated.Value(entry.pct)
      );
      Animated.stagger(
        40,
        barAnimsRef.current.map((av, i) =>
          Animated.timing(av, {
            toValue: next[i].pct,
            duration: 500,
            useNativeDriver: false,
          })
        )
      ).start();
      return next;
    });
  }, [batteryPercent, odometer]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>Dhanu</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Vehicle Overview Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.odometerLabel}>Total Distance</Text>
            <Text style={styles.odometerValue}>{odometer}</Text>
            <Text style={styles.odometerUnit}>Kilometers</Text>
          </View>
          <View style={styles.vehicleImageContainer}>
            <Image
              source={require("../../assets/motor_listrik_1.png")}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Battery Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#dcfce7" }]}
              >
                <Ionicons name="battery-charging" size={20} color="#16a34a" />
              </View>
              <Text style={styles.statTitle}>Battery</Text>
            </View>
            <Text style={styles.statValue}>{batteryPercent}%</Text>
            <Text style={styles.statSubtitle}>{batteryRange} remaining</Text>

            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: batteryAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor:
                      batteryPercent <= 20 ? "#ef4444" : "#16a34a",
                  },
                ]}
              />
            </View>

            {batteryPercent <= 20 && (
              <TouchableOpacity
                style={styles.chargeButton}
                onPress={() => setShowChargeConfirm(true)}
              >
                <Text style={styles.chargeButtonText}>Charge Now</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Billing Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}
              >
                <Ionicons name="card" size={20} color="#d97706" />
              </View>
              <Text style={styles.statTitle}>Billing</Text>
            </View>
            <Text style={styles.statValue}>{billing.amount}</Text>
            <Text style={styles.statSubtitle}>Due {billing.due}</Text>

            <TouchableOpacity
              style={styles.payButton}
              onPress={() => setShowPayModal(true)}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Temperature Status */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>System Temperature</Text>

          <View style={styles.tempGrid}>
            <View style={styles.tempItem}>
              <View
                style={[
                  styles.tempIcon,
                  { backgroundColor: colorFor(temps.motor) + "15" },
                ]}
              >
                <Ionicons
                  name="speedometer"
                  size={18}
                  color={colorFor(temps.motor)}
                />
              </View>
              <Text style={styles.tempLabel}>Motor</Text>
              <Text
                style={[styles.tempValue, { color: colorFor(temps.motor) }]}
              >
                {temps.motor}
              </Text>
            </View>

            <View style={styles.tempItem}>
              <View
                style={[
                  styles.tempIcon,
                  { backgroundColor: colorFor(temps.inverter) + "15" },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={18}
                  color={colorFor(temps.inverter)}
                />
              </View>
              <Text style={styles.tempLabel}>Inverter</Text>
              <Text
                style={[styles.tempValue, { color: colorFor(temps.inverter) }]}
              >
                {temps.inverter}
              </Text>
            </View>

            <View style={styles.tempItem}>
              <View
                style={[
                  styles.tempIcon,
                  { backgroundColor: colorFor(temps.battery) + "15" },
                ]}
              >
                <Ionicons
                  name="battery-full"
                  size={18}
                  color={colorFor(temps.battery)}
                />
              </View>
              <Text style={styles.tempLabel}>Battery</Text>
              <Text
                style={[styles.tempValue, { color: colorFor(temps.battery) }]}
              >
                {temps.battery}
              </Text>
            </View>
          </View>
        </View>

        {/* Usage Chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Battery Usage</Text>
          <BatteryUsageChart
            data={batteryHistory}
            barAnims={barAnimsRef.current}
            onBarPress={(e) => setTooltipEntry(e)}
          />
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Payment Confirmation</Text>
            <Text style={styles.modalAmount}>{billing.amount}</Text>
            <Text style={styles.modalDue}>Due Date: {billing.due}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  markPaid();
                  setShowPayModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Charge Confirmation Modal */}
      <Modal
        visible={showChargeConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChargeConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Low Battery Warning</Text>
            <Text style={styles.modalMessage}>
              Battery is below 20%. Would you like to start charging now?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowChargeConfirm(false);
                  navigation.navigate("Charge");
                }}
              >
                <Text style={styles.confirmButtonText}>Start Charging</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChargeConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  greeting: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Vehicle Card
  vehicleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  vehicleInfo: {
    flex: 1,
  },

  odometerLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },

  odometerValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },

  odometerUnit: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "400",
  },

  vehicleImageContainer: {
    width: width * 0.35,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  vehicleImage: {
    width: "100%",
    height: "100%",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },

  statSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
  },

  // Progress Bar
  progressBar: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Buttons
  chargeButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },

  chargeButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  payButton: {
    backgroundColor: "#d97706",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  payButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Section Cards
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  // Temperature Grid
  tempGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  tempItem: {
    flex: 1,
    alignItems: "center",
  },

  tempIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  tempLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },

  tempValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },

  modalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#d97706",
    textAlign: "center",
    marginBottom: 8,
  },

  modalDue: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },

  modalMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  modalButtons: {
    gap: 12,
  },

  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  confirmButton: {
    backgroundColor: "#d97706",
  },

  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: "#f3f4f6",
  },

  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
