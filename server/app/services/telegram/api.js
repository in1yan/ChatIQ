const axios = require('axios');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

const sendToTelegram = async (method, payload) => {
  if (!TOKEN) return null;
  try {
    const response = await axios.post(`${API_URL}/${method}`, payload, {
      timeout: 8000 // 8-second timeout is safe for production
    });
    return response.data;
  } catch (error) {
    console.error(`[Telegram API Error] ${method}:`, error.response?.data || error.message);
    return null;
  }
};

module.exports = { sendToTelegram };