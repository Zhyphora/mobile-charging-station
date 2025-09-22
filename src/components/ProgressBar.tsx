import React from "react";
import { View, StyleSheet } from "react-native";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  borderRadius?: number;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "#4caf50",
  height = 20,
  borderRadius = 10,
}) => {
  const pct = clamp(progress) * 100;

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <View
        style={[
          styles.bar,
          { width: `${pct}%`, backgroundColor: color, borderRadius },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
  },
});

export default ProgressBar;
