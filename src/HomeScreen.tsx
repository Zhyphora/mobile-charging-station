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
import { Modal } from "react-native";
import useVehicle from "./hooks/useVehicle";

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
    if (s.includes("normal") || s.includes("ok")) return "#22c55e"; // green
    if (s.includes("high") || s.includes("over")) return "#ef4444"; // red
    return "#334155";
  }

  const onStartCharging = () => navigation.navigate("Charge");
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    try {
      if (scale && typeof (Animated as any).spring === "function") {
        Animated.spring(scale, {
          toValue: 0.96,
          useNativeDriver: true,
        }).start();
      }
    } catch (e) {
      // ignore animation errors in environments without Animated
    }
  };
  const onPressOut = () => {
    try {
      if (scale && typeof (Animated as any).spring === "function") {
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      }
    } catch (e) {
      // ignore animation errors in environments without Animated
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <ScrollView contentContainerStyle={styles.containerDashboard}>
        <View style={styles.headerRow}>
          <Text style={styles.welcome}>
            Welcome, <Text style={{ color: "#fb923c" }}>Dhanu</Text>
          </Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardInnerRow}>
            <View style={styles.leftCardInner}>
              <Text style={styles.odometerLabel}>Odometer</Text>
              <Text style={styles.odometerValue}>{odometer}</Text>
              <Text style={styles.odometerUnit}>KM</Text>
            </View>
            <View style={styles.rightCardInner}>
              <Image
                source={require("../assets/motor_listrik_1.png")}
                style={styles.bigMotor}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoCard, styles.modeCard]}>
            <Text style={styles.infoTitle}>Mode</Text>
            <View style={styles.modeRow}>
              <View style={styles.modePill}>
                <Text style={styles.modePillText}>{mode}</Text>
              </View>
              <Text style={styles.modeDesc}>Recommended for performance</Text>
            </View>
          </View>

          <View style={[styles.infoCard, styles.batteryCard]}>
            <Text style={styles.infoTitle}>Battery</Text>
            <View style={styles.batteryRow}>
              <View style={styles.batteryLeft}>
                <Text style={styles.batteryPercent}>{batteryPercent}%</Text>
                <Text style={styles.batteryRange}>est {batteryRange} left</Text>
              </View>
              <View style={styles.batteryProgressWrap}>
                <View style={styles.batteryTrack}>
                  <View
                    style={[
                      styles.batteryFill,
                      {
                        width: `${Math.max(0, Math.min(100, batteryPercent))}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tempCard}>
          <Text style={styles.infoTitle}>Temperature</Text>
          <View style={styles.tempRowContainer}>
            <View style={styles.tempIconBox}>
              <Ionicons name="thermometer-outline" size={34} color="#ef4444" />
            </View>
            <View style={styles.tempList}>
              <View style={styles.tempRow}>
                <Text style={styles.tempLabel}>Motor</Text>
                <Text
                  style={[styles.tempStatus, { color: colorFor(temps.motor) }]}
                >
                  {temps.motor}
                </Text>
              </View>
              <View style={styles.tempRow}>
                <Text style={styles.tempLabel}>Inverter</Text>
                <Text
                  style={[
                    styles.tempStatus,
                    { color: colorFor(temps.inverter) },
                  ]}
                >
                  {temps.inverter}
                </Text>
              </View>
              <View style={styles.tempRow}>
                <Text style={styles.tempLabel}>Battery</Text>
                <Text
                  style={[
                    styles.tempStatus,
                    { color: colorFor(temps.battery) },
                  ]}
                >
                  {temps.battery}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.billStrip}>
          <View>
            <Text style={{ fontWeight: "700" }}>Total Billing</Text>
            <Text>{billing.amount}</Text>
            <Text style={{ color: "#64748b" }}>Due Date : {billing.due}</Text>
          </View>
          <TouchableOpacity
            style={styles.payButton}
            activeOpacity={0.85}
            onPress={() => setShowPayModal(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Pay</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Modal */}
        <Modal
          visible={showPayModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPayModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: "700", fontSize: 18 }}>
                Pay Billing
              </Text>
              <Text style={{ marginTop: 8 }}>{billing.amount}</Text>
              <Text style={{ color: "#64748b", marginBottom: 14 }}>
                Due Date: {billing.due}
              </Text>
              <TouchableOpacity
                style={styles.payConfirmButton}
                onPress={() => {
                  // mark as paid via hook (simulation)
                  markPaid();
                  setShowPayModal(false);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Confirm Payment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 12 }}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={{ color: "#0f172a" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Layout & Container Styles
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  containerDashboard: {
    flexGrow: 1,
    padding: 14,
    backgroundColor: "#f8fafc",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  cardContainer: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    // shadow for card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  cardInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftCardInner: {
    flex: 1,
    paddingRight: 8,
    alignItems: "flex-start",
  },

  rightCardInner: {
    width: width * 0.48,
    alignItems: "center",
    justifyContent: "center",
  },

  // Welcome Section
  welcome: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a",
  },

  // Odometer Section
  topCenter: {
    alignItems: "center",
    marginTop: 6,
  },
  odometerLabel: {
    color: "#64748b",
  },
  odometerValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#0f172a",
  },
  odometerUnit: {
    color: "#64748b",
  },

  // Motor Image Section
  bigMotorWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  bigMotor: {
    width: width * 0.44,
    height: width * 0.26,
  },

  // Info Cards Section
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  infoCard: {
    flexBasis: "48%",
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  modeCard: {
    backgroundColor: "#f8fafc",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modePill: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  modePillText: {
    color: "#fff",
    fontWeight: "700",
  },
  modeDesc: {
    color: "#64748b",
    fontSize: 12,
  },
  batteryCard: {
    backgroundColor: "#fff",
  },
  batteryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryLeft: {
    flex: 1,
  },
  batteryPercent: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  batteryRange: {
    color: "#64748b",
    fontSize: 12,
  },
  batteryProgressWrap: {
    width: 110,
    paddingLeft: 8,
  },
  batteryTrack: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  batteryFill: {
    height: "100%",
    backgroundColor: "#34d399",
  },
  infoTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  infoInnerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoValue: {
    color: "#0f172a",
  },

  // Mode Circle
  modeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  // Battery Icon
  batteryIcon: {
    width: 18,
    height: 24,
    backgroundColor: "#a3e635",
    marginRight: 10,
    borderRadius: 3,
  },

  // Temperature Card
  tempCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
  },

  // Billing Section
  billStrip: {
    marginTop: 14,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payButton: {
    backgroundColor: "#fb923c",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  // Greeting Card
  greetingCard: {
    backgroundColor: "#f6f9ff",
    padding: 20,
    borderRadius: 12,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  greetingSub: {
    marginTop: 6,
    color: "#334155",
  },

  // Motor Section
  motorWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  motorImage: {
    width: Math.min(width - 80, 520),
    height: undefined,
    aspectRatio: 16 / 9,
  },

  // CTA Button
  ctaButton: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Banner Section
  bannerContainer: {
    marginTop: 18,
  },
  bannerScroll: {
    height: 140,
  },
  bannerImage: {
    width: width - 40,
    height: 140,
    borderRadius: 10,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    backgroundColor: "#0f172a",
  },

  // Motor Card
  motorCard: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  motorCardImage: {
    width: "100%",
    height: 200,
  },
  plateBox: {
    position: "absolute",
    left: 14,
    bottom: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  plateText: {
    color: "#fff",
    fontWeight: "700",
  },
  // Temperature layout
  tempRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  tempIconBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tempList: {
    flex: 1,
  },
  tempRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  tempLabel: {
    color: "#0f172a",
  },
  tempStatus: {
    fontWeight: "700",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  payConfirmButton: {
    backgroundColor: "#fb923c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default HomeScreen;
