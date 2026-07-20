const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

function inspectSession(sid, maxChars = 8000) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SESSION: ${sid}`);
  console.log('='.repeat(80));
  
  const session = db.prepare('SELECT * FROM session WHERE id = ?').get(sid);
  console.log(`Title: ${session.title}`);
  console.log(`Created: ${new Date(session.time_created).toISOString()}`);
  
  // User messages
  const userMsgs = db.prepare(`
    SELECT substr(json_extract(p.data, '$.text'), 1, 500) as text
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created
  `).all(sid);
  
  console.log(`\n--- USER MESSAGES (${userMsgs.length}) ---`);
  for (const u of userMsgs) {
    console.log(u.text);
  }
  
  // Assistant text parts
  const textParts = db.prepare(`
    SELECT json_extract(p.data, '$.text') as text, m.agent_id
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'text'
    ORDER BY m.time_created
  `).all(sid);
  
  console.log(`\n--- ASSISTANT TEXT (${textParts.length} parts) ---`);
  let total = 0;
  for (const t of textParts) {
    const text = (t.text || '').substring(0, 1000);
    if (text.length > 10 && total < maxChars) {
      const agent = t.agent_id ? `[sub:${t.agent_id}]` : '[main]';
      console.log(`\n${agent} ${text}`);
      total += text.length;
    }
  }
  
  // Tool call summary
  const tools = db.prepare(`
    SELECT json_extract(p.data, '$.tool') as tool_name, count(*) as cnt
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'tool'
    GROUP BY tool_name
  `).all(sid);
  console.log(`\n--- TOOLS ---`);
  console.log(JSON.stringify(tools));
  
  // Get write/edit calls with file paths
  const writes = db.prepare(`
    SELECT json_extract(p.data, '$.tool') as tool_name,
           json_extract(json_extract(p.data, '$.state'), '$.input') as input
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
    ORDER BY m.time_created
  `).all(sid);
  
  if (writes.length > 0) {
    console.log(`\n--- FILE WRITES (${writes.length}) ---`);
    for (const w of writes) {
      try {
        const inputObj = JSON.parse(w.input);
        console.log(`  ${w.tool_name}: ${inputObj.file_path || 'unknown'}`);
      } catch {
        console.log(`  ${w.tool_name}: ${w.input.substring(0, 200)}`);
      }
    }
  }
}

// Inspect the SVG session and the pre-production crash session
inspectSession('ses_0a46ae078ffeIQe44ML2BzLoAt'); // SVG creation
inspectSession('ses_0b464d400ffeKcAgSCl59vgvU6'); // pre-production crash

db.close();
