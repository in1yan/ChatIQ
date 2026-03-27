const { Pool } = require('pg'); // Assuming you use 'pg' library
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getAiResponse(chatId, userText) {
  // 1. DATABASE LOOKUP: Find which business/agent this chat belongs to
  // For MSMEs, you likely store which bot_token or business_id maps to this chat
  const res = await pool.query('SELECT agent_config FROM active_agents WHERE telegram_chat_id = $1', [chatId]);
  const agentConfig = res.rows[0]?.agent_config || "Default assistant";

  // 2. AI CALL: (Example using placeholder for your LLM of choice)
  // const reply = await openAI.createChatCompletion({...});
  const reply = `AI Agent Response for: ${userText}`; // Replace with real AI call

  // 3. INSIGHTS: Log to Postgres for your Dashboard
  await pool.query(
    'INSERT INTO logs (chat_id, message, direction, sentiment) VALUES ($1, $2, $3, $4)',
    [chatId, userText, 'inbound', 'neutral']
  );

  return reply;
}

module.exports = { getAiResponse };