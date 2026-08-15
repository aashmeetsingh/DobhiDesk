// Simple in-memory OTP store, good enough for a single-instance dev/internship build.
// Swap this for Redis (with TTL) before running multiple server instances in production.

const store = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function save(phone, otp) {
  store.set(phone, { otp, expiresAt: Date.now() + TTL_MS });
}

function verify(phone, otp) {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }
  const isValid = entry.otp === otp;
  if (isValid) store.delete(phone); // one-time use
  return isValid;
}

module.exports = { save, verify };
