import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useVehicle from "../hooks/useVehicle";

const ProfileScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { odometer, batteryPercent, billing } = useVehicle();

  const user = {
    name: "Dhanu Pratama",
    email: "dhanu@example.com",
    memberSince: "2023",
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userSince}>
                Member since {user.memberSince}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="pencil" size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Odometer</Text>
            <Text style={styles.statValue}>{odometer}</Text>
            <Text style={styles.statHint}>Kilometers</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Battery</Text>
            <Text style={styles.statValue}>{batteryPercent}%</Text>
            <Text style={styles.statHint}>Estimated</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Billing</Text>
            <Text style={[styles.statValue, { color: "#d97706" }]}>
              {billing?.amount || "Rp 0"}
            </Text>
            <Text style={styles.statHint}>Due {billing?.due || "--"}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#3b82f6" }]}
            onPress={() => navigation.navigate("Charging")}
          >
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.actionText}>My Vehicles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
            onPress={() => navigation.navigate("Payments")}
          >
            <Ionicons name="card" size={18} color="#fff" />
            <Text style={styles.actionText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#f59e0b" }]}
            onPress={() => navigation.navigate("Support")}
          >
            <Ionicons name="help-circle" size={18} color="#fff" />
            <Text style={styles.actionText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Settings / Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="person" size={20} color="#0f172a" />
              <Text style={styles.rowText}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Notifications")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={20} color="#0f172a" />
              <Text style={styles.rowText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Security")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed" size={20} color="#0f172a" />
              <Text style={styles.rowText}>Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutRow}
            onPress={() => console.log("Sign out")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
              <Text style={[styles.rowText, { color: "#ef4444" }]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 20, paddingBottom: 40 },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },

  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#3730a3" },
  userInfo: { marginLeft: 12 },
  userName: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  userEmail: { fontSize: 13, color: "#64748b", marginTop: 2 },
  userSince: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  editButton: { backgroundColor: "#f1f5f9", padding: 8, borderRadius: 10 },

  statsRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  statHint: { fontSize: 12, color: "#9ca3af", marginTop: 6 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    flexDirection: "row",
    gap: 8,
  },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { marginLeft: 4, fontSize: 15, color: "#0f172a", fontWeight: "600" },

  signOutRow: { marginTop: 12, paddingVertical: 12 },
});

export default ProfileScreen;
