import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { validatePayment } from "../services/payments";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payload?: string;
};

export default function QRISModal({
  visible,
  onClose,
  onSuccess,
  payload,
}: Props) {
  // Lazily load optional native/3rd-party modules only when needed
  const [BarcodeModule, setBarcodeModule] = React.useState<any | null>(null);
  const [QRCode, setQRCode] = React.useState<any | null>(null);
  const [svgAvailable, setSvgAvailable] = React.useState<boolean>(false);
  const [showQRCode, setShowQRCode] = React.useState<boolean>(false);

  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null
  );
  const [scanned, setScanned] = React.useState(false);
  const [showCamera, setShowCamera] = React.useState(false);
  const [loadingScanner, setLoadingScanner] = React.useState(false);

  // load QRCode library only when the user requests to view the QR
  React.useEffect(() => {
    let mounted = true;
    if (!showQRCode) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QR = require("react-native-qrcode-svg").default;
      // also ensure react-native-svg exists (qr component depends on it)
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Svg = require("react-native-svg");
        if (mounted) setSvgAvailable(!!Svg);
      } catch (err) {
        if (mounted) setSvgAvailable(false);
      }
      if (mounted) setQRCode(QR);
    } catch (e) {
      if (mounted) setQRCode(null);
    }
    return () => {
      mounted = false;
    };
  }, [showQRCode]);

  // When the user explicitly asks to open the camera scanner, try to load
  // the native scanner module and request permission. This avoids requiring
  // the native module at module-eval time which causes the "Cannot find
  // native module 'ExpoBarCodeScanner'" error in builds that don't include it.
  React.useEffect(() => {
    let mounted = true;
    if (!showCamera) return;
    if (BarcodeModule) return; // already loaded

    (async () => {
      setLoadingScanner(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Barcode = require("expo-barcode-scanner");
        if (!mounted) return;
        setBarcodeModule(Barcode);
        try {
          const res = await Barcode.BarCodeScanner.requestPermissionsAsync();
          if (mounted) setHasPermission(res.status === "granted");
        } catch (err) {
          if (mounted) setHasPermission(false);
        }
      } catch (err) {
        // couldn't require the native module (likely not installed in this build)
        if (mounted) {
          setBarcodeModule(null);
          setHasPermission(false);
        }
      } finally {
        if (mounted) setLoadingScanner(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showCamera, BarcodeModule]);

  const handleScanned = (event: any) => {
    if (scanned) return;
    setScanned(true);
    // event.data contains the scanned string
    // guard against null event
    const data = event && (event as any).data ? (event as any).data : null;
    (async () => {
      if (!data) {
        // nothing scanned
        return;
      }
      // validate scanned payload with payments service
      const res = await validatePayment(data);
      if (res.ok) {
        onSuccess();
      } else {
        // show a simple alert fallback
        // eslint-disable-next-line no-alert
        alert(res.message || "Payment validation failed");
      }
    })();
  };

  const effectivePayload = payload || "payment://qris/123456";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Scan QRIS</Text>
          <Text style={styles.subtitle}>
            Scan using your banking app to pay.
          </Text>
          <View style={styles.qrBox}>
            {showCamera ? (
              loadingScanner ? (
                <ActivityIndicator size="large" />
              ) : BarcodeModule ? (
                hasPermission === null ? (
                  <ActivityIndicator size="large" />
                ) : hasPermission === false ? (
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#ef4444" }}>
                      Camera permission required
                    </Text>
                    <TouchableOpacity
                      onPress={onClose}
                      style={{ marginTop: 10 }}
                    >
                      <Text style={{ color: "#0f172a" }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                ) : BarcodeModule.BarCodeScanner ? (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <BarcodeModule.BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleScanned}
                    style={{ width: 260, height: 260, borderRadius: 8 }}
                  />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#ef4444", textAlign: "center" }}>
                      Native camera view not available in this build.
                    </Text>
                    <Text
                      style={{
                        color: "#64748b",
                        marginTop: 6,
                        textAlign: "center",
                      }}
                    >
                      If you need scanning, install `expo-barcode-scanner` and
                      rebuild the dev client, or test on a device with a
                      compatible build.
                    </Text>
                  </View>
                )
              ) : showQRCode ? (
                QRCode && svgAvailable ? (
                  <QRCode value={effectivePayload} size={160} />
                ) : (
                  <Image
                    source={require("../../assets/banner_ads.png")}
                    style={{ width: 160, height: 160 }}
                  />
                )
              ) : (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={styles.openCameraBtn}
                    onPress={() => {
                      setScanned(false);
                      setShowCamera(true);
                    }}
                  >
                    <Text style={{ color: "#0f172a", fontWeight: "700" }}>
                      Open Camera Scanner
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.openCameraBtn}
                    onPress={() => setShowQRCode(true)}
                  >
                    <Text style={{ color: "#0f172a", fontWeight: "700" }}>
                      Show QR
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <TouchableOpacity
                style={styles.openCameraBtn}
                onPress={() => {
                  setScanned(false);
                  setShowCamera(true);
                }}
              >
                <Text style={{ color: "#0f172a", fontWeight: "700" }}>
                  Open Camera Scanner
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {(__DEV__ || !BarcodeModule || hasPermission === false) && (
            <TouchableOpacity
              style={styles.successBtn}
              onPress={async () => {
                if (__DEV__) {
                  // in dev, allow simulating a validated scan
                  const res = await validatePayment(effectivePayload);
                  if (res.ok) onSuccess();
                  else alert(res.message || "Validation failed");
                } else {
                  onSuccess();
                }
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Simulate Successful Scan
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={{ color: "#0f172a" }}>Cancel</Text>
          </TouchableOpacity>
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
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  title: { fontWeight: "800", fontSize: 18 },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 12 },
  qrBox: { marginVertical: 12 },
  successBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  openCameraBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelBtn: { marginTop: 12 },
});
