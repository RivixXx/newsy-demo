const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

const sessionId = 'ses_081dae868ffeOZI40wU0AjQwjV';

// Get only write/edit tool calls
const tools = db.prepare(`
  SELECT m.id as msg_id,
         json_extract(p.data, '$.tool') as tool_name,
         json_extract(json_extract(p.data, '$.state'), '$.input') as input,
         substr(json_extract(json_extract(p.data, '$.state'), '$.output'), 1, 500) as output_preview,
         m.time_created
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(p.data, '$.type') = 'tool'
    AND json_extract(p.data, '$.tool') IN ('write', 'edit', 'bash')
  ORDER BY m.time_created, p.time_created
`).all(sessionId);

console.log(`=== WRITE/EDIT/BASH TOOL CALLS (${tools.length}) ===`);
for (const t of tools) {
  console.log(`\n--- ${t.tool_name} (msg=${t.msg_id}) ---`);
  console.log('INPUT:', (t.input || '').substring(0, 1500));
  console.log('OUTPUT:', (t.output_preview || '').substring(0, 500));
}

// Also get ALL tool calls to see if I missed anything
const allTools = db.prepare(`
  SELECT json_extract(p.data, '$.tool') as tool_name, count(*) as cnt
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(p.data, '$.type') = 'tool'
  GROUP BY tool_name
`).all(sessionId);

console.log('\n=== TOOL CALL SUMMARY ===');
console.log(JSON.stringify(allTools, null, 2));

// Check for any step-start/step-finish
const steps = db.prepare(`
  SELECT json_extract(p.data, '$.type') as part_type,
         substr(p.data, 1, 500) as preview
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE m.session_id = ?
    AND json_extract(p.data, '$.type') IN ('step-start', 'step-finish')
  ORDER BY m.time_created, p.time_created
`).all(sessionId);

console.log(`\n=== STEPS (${steps.length}) ===`);
for (const s of steps) {
  console.log(`${s.part_type}: ${s.preview}`);
}

db.close();
