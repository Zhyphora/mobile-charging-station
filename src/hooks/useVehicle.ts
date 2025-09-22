import React from "react";

type Temps = { motor: string; inverter: string; battery: string };

export default function useVehicle() {
  const [odometer, setOdometer] = React.useState<number>(759);
  const [mode, setMode] = React.useState<string>("Sport");
  const [batteryPercent, setBatteryPercent] = React.useState<number>(100);
  const [batteryRange, setBatteryRange] = React.useState<string>("128 km");
  const [temps, setTemps] = React.useState<Temps>({
    motor: "NORMAL",
    inverter: "HIGH",
    battery: "OVER HEAT",
  });
  const [billing, setBilling] = React.useState<{ amount: string; due: string }>(
    { amount: "Rp 200.000", due: "08/08/23" }
  );

  // Simulate live updates in dev: decrement battery slowly
  React.useEffect(() => {
    const iv = setInterval(() => {
      setBatteryPercent((p) => {
        const next = Math.max(0, p - 1);
        setBatteryRange(`${Math.max(0, Math.round((next / 100) * 200))} km`);
        return next;
      });
    }, 8000); // slow tick
    return () => clearInterval(iv);
  }, []);

  // expose a small API for manual changes (useful for tests)
  const setModeExternal = React.useCallback((m: string) => setMode(m), []);
  const markPaid = React.useCallback(
    () => setBilling({ ...billing, amount: "Rp 0" }),
    [billing]
  );

  return {
    odometer,
    mode,
    batteryPercent,
    batteryRange,
    temps,
    billing,
    setMode: setModeExternal,
    markPaid,
  };
}
