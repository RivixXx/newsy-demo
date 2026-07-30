const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

const sessionId = 'ses_081dae868ffeOZI40wU0AjQwjV';

// Get all tool calls with their inputs/outputs
const tools = db.prepare(`
  SELECT m.id as msg_id, m.agent_id,
         json_extract(p.data, '$.type') as part_type,
         json_extract(p.data, '$.tool') as tool_name,
         json_extract(json_extract(p.data, '$.state'), '$.input') as input,
         substr(json_extract(json_extract(p.data, '$.state'), '$.output'), 1, 500) as output_preview,
         m.time_created
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(p.data, '$.type') = 'tool'
  ORDER BY m.time_created, p.time_created
`).all(sessionId);

console.log(`=== TOOL CALLS (${tools.length}) ===`);
for (const t of tools) {
  const agentLabel = t.agent_id ? `[sub:${t.agent_id}]` : '[main]';
  console.log(`\n--- ${agentLabel} ${t.tool_name} (msg=${t.msg_id}) ---`);
  console.log('INPUT:', (t.input || '').substring(0, 600));
  console.log('OUTPUT:', (t.output_preview || '').substring(0, 400));
}

db.close();
