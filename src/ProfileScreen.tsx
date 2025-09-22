import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const ProfileScreen: React.FC = () => {
  const route: any = useRoute();
  const type = route.params?.type ?? "profile";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{(type || "Profile").toString()}</Text>
      <Text style={styles.text}>This is the screen for: {type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});

export default ProfileScreen;
