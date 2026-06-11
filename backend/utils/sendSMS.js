import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to, message) => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
    console.log("SMS disabled: missing Twilio environment variables");
    console.log("To:", to);
    console.log("Message:", message);
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });
    console.log("SMS sent to:", to);
  } catch (err) {
    console.log("SMS ERROR:", err.message);
  }
};