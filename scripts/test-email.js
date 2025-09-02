// scripts/test-email.js
const { Resend } = require('resend');

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY in environment');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  try {
    const res = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'futbott97@gmail.com',
      subject: 'FUTBot Test Email ✅',
      html: '<p>Test email from FUTBot via Resend working ✅</p>'
    });
    console.log('Sent:', res);
  } catch (e) {
    console.error('Error:', e?.response?.data || e);
    process.exit(1);
  }
}

main();


