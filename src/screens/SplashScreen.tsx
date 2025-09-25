import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import ProgressBar from "../components/ProgressBar";
import { Ionicons } from "@expo/vector-icons";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = React.useState(0);
  const opacity = React.useRef(new Animated.Value(1)).current;
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const logoSpin = React.useRef(new Animated.Value(0)).current;

  // Animasi untuk logo berputar
  useEffect(() => {
    Animated.loop(
      Animated.timing(logoSpin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate =
    logoSpin && typeof logoSpin.interpolate === "function"
      ? logoSpin.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        })
      : "0deg";

  useEffect(() => {
    // Animasi scaling saat komponen dimuat
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          // fade out then finish
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => onFinish());
          return 1;
        }
        return prev + 0.02;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity, transform: [{ scale }] }]}
      >
        <View style={styles.logoSection}>
          <Animated.View
            style={[styles.logoContainer, { transform: [{ rotate }] }]}
          >
            <Ionicons name="flash" size={64} color="#d97706" />
          </Animated.View>
          <View style={styles.logoBackground} />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Mobile Charging Station</Text>
          <Text style={styles.subtitle}>Powering Your Journey</Text>
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            color="#d97706"
            height={6}
            borderRadius={3}
          />
          <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Charging Solutions</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  logoSection: {
    position: "relative",
    marginBottom: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 60,
    elevation: 8,
    shadowColor: "#d97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 2,
  },
  logoBackground: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#d97706",
    opacity: 0.08,
    zIndex: 1,
  },
  textSection: {
    alignItems: "center",
    marginBottom: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "400",
  },
  progressSection: {
    width: "100%",
    alignItems: "center",
  },
  percent: {
    fontSize: 14,
    color: "#d97706",
    fontWeight: "600",
    marginTop: 16,
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "400",
  },
});

export default SplashScreen;
