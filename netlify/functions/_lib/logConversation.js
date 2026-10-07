// Best-effort chat logging to assistant_conversations (see migration
// 20240113_assistant_conversations.sql). Never throws — a logging failure
// must not break the actual chat response.
export async function logConversation(admin, {
  userId = null,
  mode,
  brandName = null,
  scanSnapshot = null,
  userMessage,
  assistantReply,
  flagged = false,
}) {
  if (!admin) return;
  try {
    await admin.from('assistant_conversations').insert({
      user_id: userId,
      mode,
      brand_name: brandName,
      scan_snapshot: scanSnapshot,
      user_message: userMessage,
      assistant_reply: assistantReply,
      flagged,
    });
  } catch (err) {
    console.warn('assistant_conversations log failed:', err?.message || err);
  }
}
