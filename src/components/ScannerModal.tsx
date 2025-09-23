import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { validatePayment } from "../services/payments";

// Lazy load camera to avoid crashes in Expo Go
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (e) {
  // Camera module not available in this build
  console.log("expo-camera not available in this build");
}

// Provide a safe fallback so we can call the hook unconditionally
if (!useCameraPermissions) {
  useCameraPermissions = () => {
    // return [permission, requestPermission]
    const perm = null;
    const req = async () => perm;
    return [perm, req];
  };
}

type Props = {
  visible: boolean;
  onClose: () => void;
  // onSuccess receives the validatePayment result
  onSuccess: (res: { ok: boolean; data?: any; message?: string }) => void;
};

export default function ScannerModal({ visible, onClose, onSuccess }: Props) {
  const [permission, setPermission] = React.useState<any>(null);
  const [scanned, setScanned] = React.useState(false);
  const [cameraAvailable] = React.useState<boolean>(() => !!CameraView);

  // Call the permission hook (either the real hook or the safe fallback)
  const [perm, requestPermission] = useCameraPermissions();

  React.useEffect(() => {
    if (visible) setScanned(false);
    // keep local permission state in sync with the hook
    setPermission(perm);
  }, [visible, perm]);

  // When modal opens, if we have no permission or not granted, request it automatically
  React.useEffect(() => {
    let mounted = true;
    if (visible && cameraAvailable) {
      // if permission is null or not granted, request it
      if (!perm || !perm.granted) {
        // small debounce to avoid immediate double-calls
        const t = setTimeout(() => {
          if (!mounted) return;
          try {
            // requestPermission may be async
            requestPermission && requestPermission();
          } catch (e) {
            // ignore
            console.log("requestPermission failed", e);
          }
        }, 200);
        return () => {
          mounted = false;
          clearTimeout(t);
        };
      }
    }
    return () => {
      mounted = false;
    };
  }, [visible, cameraAvailable, perm, requestPermission]);

  const handleScanned = React.useCallback(
    async (e: any) => {
      if (scanned) return;
      setScanned(true);
      const data = e && e.data ? e.data : null;
      if (!data) return;
      const res = await validatePayment(data);
      if (res.ok) onSuccess(res);
      else {
        // eslint-disable-next-line no-alert
        alert(res.message || "Member kamu tidak valid");
        setScanned(false);
      }
    },
    [scanned, onSuccess]
  );

  const simulate = React.useCallback(async () => {
    // dev-only helper
    const payload = JSON.stringify({ amount: 200000, invoice: "SIM-INV" });
    const res = await validatePayment(payload);
    if (res.ok) onSuccess(res);
    else alert(res.message || "Simulate failed");
  }, [onSuccess]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Scan Member QR</Text>
          <Text style={styles.subtitle}>
            Arahkan kamera ke QR member untuk mengisi motor listrik.
          </Text>

          <View style={{ marginVertical: 12 }}>
            {!cameraAvailable ? (
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#ef4444", textAlign: "center" }}>
                  Native camera tidak tersedia di Expo Go.
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  Gunakan development build untuk menggunakan kamera.
                </Text>
              </View>
            ) : !permission ? (
              <ActivityIndicator size="large" />
            ) : !permission.granted ? (
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#ef4444" }}>
                  Izin kamera diperlukan untuk scan.
                </Text>
                <TouchableOpacity
                  onPress={requestPermission}
                  style={styles.smallBtn}
                >
                  <Text style={{ color: "#0f172a" }}>Minta Izin Kamera</Text>
                </TouchableOpacity>
              </View>
            ) : CameraView ? (
              <CameraView
                style={{ width: 260, height: 260, borderRadius: 8 }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleScanned}
              />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#ef4444" }}>
                  Camera view tidak tersedia.
                </Text>
              </View>
            )}
          </View>

          {__DEV__ && (
            <TouchableOpacity style={styles.simBtn} onPress={simulate}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Simulate Successful Scan
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: "#0f172a", fontWeight: "700" }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 340,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  title: { fontWeight: "800", fontSize: 18 },
  subtitle: {
    color: "#64748b",
    marginTop: 6,
    marginBottom: 12,
    textAlign: "center",
  },
  simBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smallBtn: {
    marginTop: 8,
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 8,
  },
});
