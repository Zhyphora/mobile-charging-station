import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: any;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function ButtonCard({
  title,
  subtitle,
  onPress,
  style,
  children,
  icon,
  variant = "secondary",
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, style, isPrimary ? styles.cardPrimary : null]}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isPrimary ? styles.titlePrimary : null]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                isPrimary ? styles.subtitlePrimary : null,
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPrimary: {
    backgroundColor: "#0f172a",
  },
  iconWrap: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flexDirection: "row", alignItems: "center" },
  title: { fontWeight: "700", color: "#0f172a" },
  titlePrimary: { color: "#fff" },
  subtitle: { color: "#64748b", marginTop: 4 },
  subtitlePrimary: { color: "#cbd5e1" },
});
