import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const navigation: any = useNavigation();

  const onStartCharging = () => navigation.navigate("Charge");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <View style={styles.container}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Hai Dhanu!</Text>
          <Text style={styles.greetingSub}>
            Selamat datang di Charging Moto
          </Text>
        </View>

        <View style={styles.motorWrapper}>
          {/* If you have a local asset, place it in /assets and use:
              source={require('../assets/motor.png')}
              This avoids remote loading and looks better in production. */}
          <Image
            source={{ uri: "https://placehold.co/600x360?text=Motor+Listrik" }}
            style={styles.motorImage}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={onStartCharging}
          >
            <Text style={styles.ctaText}>Mulai Charging</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  greetingCard: {
    backgroundColor: "#f6f9ff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
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
});

export default HomeScreen;
