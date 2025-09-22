// Lightweight payment validation shim.
// In production, replace validatePayment with a real network call to your backend.
export type ValidateResult = {
  ok: boolean;
  message?: string;
  data?: any;
};

export async function validatePayment(
  payload: string
): Promise<ValidateResult> {
  // If an environment variable PAYMENTS_URL is provided, you could forward to it.
  // For now, simulate a network call with a short delay.
  try {
    await new Promise((r) => setTimeout(r, 700));
    if (!payload) return { ok: false, message: "Empty payload" };
    // crude heuristics: accept if contains 'qris' or 'payment' or is JSON-like
    const lower = payload.toLowerCase();
    if (
      lower.includes("qris") ||
      lower.includes("payment") ||
      payload.trim().startsWith("{")
    ) {
      return { ok: true, data: { invoice: "SIM-INV-001", amount: 200000 } };
    }
    // numeric payloads (e.g., scanned code with digits)
    if (/^\d+$/.test(payload.trim())) {
      return {
        ok: true,
        data: { invoice: `NUM-${payload.trim()}`, amount: 50000 },
      };
    }
    return { ok: false, message: "Unrecognized payment payload" };
  } catch (e) {
    return { ok: false, message: "Network or validation error" };
  }
}
