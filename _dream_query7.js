const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

// Check the brevo→resend switch and analysis sessions
const sessions = [
  'ses_0c8d6d9ebffeB5La4SQsyHi1ux', // Сбой с brevo.com, переход на resend.com
  'ses_0c931c803ffe94YlEWB0wHC9ec', // Проверка analysis_newsy.md и walkthrough.md
  'ses_0dd8d6950ffeMwR3YAhPnkUdaI', // Анализ и исправление сервиса
];

for (const sid of sessions) {
  const session = db.prepare('SELECT title, time_created FROM session WHERE id = ?').get(sid);
  console.log(`\n=== ${session.title} (${new Date(session.time_created).toISOString()}) ===`);
  
  // User messages
  const userMsgs = db.prepare(`
    SELECT substr(json_extract(p.data, '$.text'), 1, 400) as text
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created
  `).all(sid);
  for (const u of userMsgs) {
    console.log(`  USER: ${u.text}`);
  }
  
  // Tool call summary
  const tools = db.prepare(`
    SELECT json_extract(p.data, '$.tool') as tool_name, count(*) as cnt
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'tool'
    GROUP BY tool_name
  `).all(sid);
  console.log(`  TOOLS: ${JSON.stringify(tools.map(t => t.tool_name + ':' + t.cnt))}`);
  
  // Key assistant text (first and last)
  const textParts = db.prepare(`
    SELECT json_extract(p.data, '$.text') as text, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'text'
    ORDER BY m.time_created
  `).all(sid);
  
  if (textParts.length > 0) {
    console.log(`  FIRST: ${(textParts[0].text || '').substring(0, 300)}`);
    const last = textParts[textParts.length - 1];
    console.log(`  LAST: ${(last.text || '').substring(0, 300)}`);
  }
  
  // Write/edit file list
  const writes = db.prepare(`
    SELECT json_extract(p.data, '$.tool') as tool_name,
           json_extract(json_extract(p.data, '$.state'), '$.input') as input
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
  `).all(sid);
  
  if (writes.length > 0) {
    console.log(`  FILES:`);
    for (const w of writes) {
      try {
        const inputObj = JSON.parse(w.input);
        console.log(`    ${w.tool_name}: ${inputObj.file_path || 'unknown'}`);
      } catch {
        // skip
      }
    }
  }
}

db.close();
