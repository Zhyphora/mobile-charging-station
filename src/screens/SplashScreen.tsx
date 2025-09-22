import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";
import ProgressBar from "../components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = React.useState(0);
  const opacity = React.useRef(new Animated.Value(1)).current;
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const logoSpin = React.useRef(new Animated.Value(0)).current;

  // Animasi untuk logo berputar
  useEffect(() => {
    Animated.loop(
      Animated.timing(logoSpin, {
        toValue: 1,
        duration: 3000,
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
      duration: 800,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          // fade out then finish
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => onFinish());
          return 1;
        }
        return prev + 0.02; // Progress lebih cepat
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={["#1a237e", "#3949ab", "#7986cb"]}
      style={styles.container}
    >
      <Animated.View
        style={[styles.content, { opacity, transform: [{ scale }] }]}
      >
        <Animated.View
          style={[styles.logoContainer, { transform: [{ rotate }] }]}
        >
          <Ionicons name="flash" size={80} color="#fff" />
        </Animated.View>
        <Text style={styles.title}>Mobile Charging Station</Text>
        <Text style={styles.subtitle}>Powering Your Journey</Text>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color="#ffeb3b"
            height={12}
            borderRadius={6}
          />
          <View style={styles.percentContainer}>
            <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 Charging Solutions</Text>
        </View>
      </Animated.View>

      {/* Efek latar belakang */}
      <View style={styles.circle1}></View>
      <View style={styles.circle2}></View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40,
    fontStyle: "italic",
  },
  progressContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
  },
  percentContainer: {
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percent: {
    fontSize: 18,
    color: "#ffeb3b",
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -100,
    left: -50,
    zIndex: -1,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -50,
    right: -30,
    zIndex: -1,
  },
});

export default SplashScreen;
