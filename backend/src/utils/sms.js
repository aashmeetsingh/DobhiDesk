// Stub SMS sender. Replace the body of sendOtp() with a real provider call
// (e.g. Twilio, MSG91, Fast2SMS) once you have an account + API key.
// Until then, this just logs the OTP to the server console so you can test the flow.

async function sendOtp(phone, otp) {
  if (!process.env.SMS_PROVIDER_API_KEY) {
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return { success: true, dev: true };
  }

  // Example shape for a real provider — replace with actual SDK/fetch call:
  // await fetch('https://api.smsprovider.com/send', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.SMS_PROVIDER_API_KEY}` },
  //   body: JSON.stringify({ to: phone, message: `Your LaundryTrack OTP is ${otp}` }),
  // });

  return { success: true };
}

module.exports = { sendOtp };
