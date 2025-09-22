import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "../components/ProgressBar";
import ButtonCard from "../components/ButtonCard";
import QRISModal from "../components/QRISModal";

const ChargingScreen: React.FC = () => {
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0..1
  const [seconds, setSeconds] = React.useState(0);
  const [showScanner, setShowScanner] = React.useState(false);

  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
        setProgress((p) => Math.min(1, p + 0.01));
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
      setShowScanner(true);
      return;
    }
    // require QRIS scan before starting if currently stopped
    if (!running) {
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
              : "Tap to pay (QRIS) before charging"
          }
          onPress={toggle}
          style={{ marginTop: 18, width: "100%" }}
        />

        <QRISModal
          visible={showScanner}
          payload={JSON.stringify({
            amount: 200000,
            currency: "IDR",
            invoice: "INV-20250922-01",
          })}
          onClose={() => setShowScanner(false)}
          onSuccess={() => {
            setShowScanner(false);
            setRunning(true);
          }}
        />
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
});

export default ChargingScreen;
