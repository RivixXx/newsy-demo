const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

const sessionId = 'ses_081dae868ffeOZI40wU0AjQwjV';

// Get user messages (key decisions and directives)
const userMsgs = db.prepare(`
  SELECT m.id as msg_id,
         json_extract(m.data, '$.role') as role,
         substr(p.data, 1, 2000) as preview
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(m.data, '$.role') = 'user'
  ORDER BY m.time_created, p.time_created
`).all(sessionId);

console.log(`=== USER MESSAGES (${userMsgs.length}) ===`);
for (const r of userMsgs) {
  console.log(`\n--- msg=${r.msg_id} ---`);
  console.log(r.preview);
}

// Get session info
const session = db.prepare('SELECT * FROM session WHERE id = ?').get(sessionId);
console.log('\n=== SESSION INFO ===');
console.log(JSON.stringify(session, null, 2));

// Get assistant messages with text parts only (decisions, explanations)
const textParts = db.prepare(`
  SELECT m.id as msg_id,
         json_extract(p.data, '$.type') as part_type,
         json_extract(p.data, '$.text') as text_content,
         m.agent_id
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'text'
  ORDER BY m.time_created
`).all(sessionId);

console.log(`\n=== ASSISTANT TEXT PARTS (${textParts.length}) ===`);
for (const r of textParts) {
  const text = (r.text_content || '').substring(0, 1500);
  if (text.length > 10) {
    const agentLabel = r.agent_id ? `[sub:${r.agent_id}]` : '[main]';
    console.log(`\n--- ${agentLabel} msg=${r.msg_id} ---`);
    console.log(text);
  }
}

db.close();
