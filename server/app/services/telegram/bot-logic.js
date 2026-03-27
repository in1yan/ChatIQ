const { sendToTelegram } = require('./api');
const { getAiResponse } = require('./agent-manager');

async function handleBotUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const userText = message.text;

  try {
    // START ASYNC WORK: Don't block the webhook response
    // In production, your AI might be slow. 
    // You can send a "Typing..." action to the user first.
    await sendToTelegram('sendChatAction', { chat_id: chatId, action: 'typing' });

    const aiReply = await getAiResponse(chatId, userText);

    await sendToTelegram('sendMessage', {
      chat_id: chatId,
      text: aiReply,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('[Bot Logic Error]:', err.message);
  }
}

module.exports = { handleBotUpdate };