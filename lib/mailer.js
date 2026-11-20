// Sends the OTP email from the server, so the code never has to reach the browser.
// Uses the EmailJS REST API. In the EmailJS dashboard, enable
// "Account > Security > Allow EmailJS API for non-browser applications".
// If the EmailJS variables are not set (local development), the OTP is printed
// to the server console instead.

async function sendOtpEmail({ name, email, code }) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log(`[dev] OTP for ${email}: ${code}`);
    return;
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { name, email, code },
    }),
  });

  if (!res.ok) {
    throw new Error(`EmailJS error ${res.status}: ${await res.text()}`);
  }
}

module.exports = { sendOtpEmail };
