require('dotenv').config();
const { sendToTelegram } = require('./services/telegram/api');

async function check() {
  console.log("Testing connection to Telegram...");
  const result = await sendToTelegram('getMe', {});
  if (result && result.ok) {
    console.log(`✅ Success! Bot Name: ${result.result.first_name}`);
  } else {
    console.log("❌ Failed. Check your TELEGRAM_BOT_TOKEN in .env");
  }
}
check();