import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

type Entry = { t: number; pct: number; odo: number };

export default function BatteryUsageChart({
  data,
  barAnims,
  onBarPress,
}: {
  data?: Entry[];
  barAnims?: Animated.Value[];
  onBarPress?: (entry: Entry) => void;
}) {
  const entries =
    data && data.length ? data : [{ t: Date.now(), pct: 100, odo: 0 }];
  // compute ranges
  const pcts = entries.map((e) => e.pct);
  const max = Math.max(...pcts);
  const min = Math.min(...pcts);
  const range = Math.max(1, max - min);

  // compute deltas between successive points
  const deltas = entries.map((e, i) => {
    if (i === 0) return { dp: 0, dk: 0 };
    const prev = entries[i - 1];
    return {
      dp: Math.round(prev.pct - e.pct),
      dk: Math.round(e.odo - prev.odo),
    };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{ flexDirection: "row", alignItems: "flex-end", height: 80 }}
      >
        {entries.map((e, i) => {
          const time = new Date(e.t);
          const label = `${time.getHours()}:${String(
            time.getMinutes()
          ).padStart(2, "0")}`;
          const delta = deltas[i];
          const av = barAnims && barAnims[i];
          const maxBarPx = 56; // pixel height for 100%
          const heightStyle = av
            ? {
                height: av.interpolate({
                  inputRange: [0, 100],
                  outputRange: [8, maxBarPx],
                }),
              }
            : {
                height: Math.max(
                  8,
                  Math.round(((e.pct - min) / range) * maxBarPx)
                ),
              };
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onBarPress && onBarPress(e)}
              activeOpacity={0.8}
              style={{ alignItems: "center", marginRight: 8 }}
            >
              <Animated.View
                style={[
                  {
                    width: 18,
                    backgroundColor: "#06b6d4",
                    borderRadius: 4,
                  },
                  heightStyle,
                ]}
              />
              <Text style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>
                {label}
              </Text>
              <Text style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>
                -{delta.dp}% / +{delta.dk}km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
