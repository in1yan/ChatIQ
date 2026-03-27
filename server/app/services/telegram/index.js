const { sendToTelegram } = require('./api');
const { handleBotUpdate } = require('./bot-logic');

/**
 * High-level function for your app to send alerts/notifications manually
 */
const notifyAdmin = async (text) => {
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  if (!adminChatId) return;
  
  return await sendToTelegram('sendMessage', {
    chat_id: adminChatId,
    text: `⚠️ <b>Admin Alert:</b>\n${text}`,
    parse_mode: 'HTML'
  });
};

module.exports = {
  sendToTelegram,
  handleBotUpdate,
  notifyAdmin
};