import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', { readOnly: true });

const action = process.argv[2];

if (action === 'schema') {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'sessions') {
  const rows = db.prepare(`
    SELECT id, session_id, title, time_created 
    FROM session 
    WHERE project_id = '854d69f0-9fcb-49df-8567-269794916197' 
    ORDER BY time_created DESC 
    LIMIT 20
  `).all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'session-messages') {
  const sessionId = process.argv[3];
  const rows = db.prepare(`
    SELECT m.id, m.agent_id, m.time_created, json_extract(m.data, '$.role') as role,
           substr(json_extract(m.data, '$.content'), 1, 200) as content_preview
    FROM message m
    WHERE m.session_id = ?
    ORDER BY m.time_created
  `).all(sessionId);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'session-parts') {
  const sessionId = process.argv[3];
  const rows = db.prepare(`
    SELECT m.id as msg_id, m.agent_id, json_extract(m.data, '$.role') as role,
           json_extract(p.data, '$.type') as part_type,
           json_extract(p.data, '$.tool') as tool,
           substr(p.data, 1, 600) as preview
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ?
    ORDER BY m.time_created, p.time_created
  `).all(sessionId);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'search-user') {
  const keyword = process.argv[3];
  const rows = db.prepare(`
    SELECT m.session_id, m.id as msg_id, m.time_created,
           substr(json_extract(m.data, '$.content'), 1, 300) as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
      AND json_extract(m.data, '$.content') LIKE ?
    ORDER BY m.time_created DESC
    LIMIT 15
  `).all(`%${keyword}%`);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'recent-parts') {
  const sessionId = process.argv[3];
  const rows = db.prepare(`
    SELECT m.id as msg_id, m.agent_id, json_extract(m.data, '$.role') as role,
           json_extract(p.data, '$.type') as part_type,
           json_extract(p.data, '$.tool') as tool,
           json_extract(p.data, '$.state.output') as tool_output,
           substr(json_extract(p.data, '$.text'), 1, 400) as text_preview
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ?
    ORDER BY m.time_created DESC, p.time_created DESC
    LIMIT 50
  `).all(sessionId);
  console.log(JSON.stringify(rows, null, 2));
}

db.close();
