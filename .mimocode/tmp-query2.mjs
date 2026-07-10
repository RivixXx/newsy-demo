import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', { readOnly: true });

const action = process.argv[2];
const arg = process.argv[3];

if (action === 'schema-session') {
  const rows = db.prepare("PRAGMA table_info(session)").all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'schema-message') {
  const rows = db.prepare("PRAGMA table_info(message)").all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'schema-part') {
  const rows = db.prepare("PRAGMA table_info(part)").all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'sessions') {
  const rows = db.prepare(`
    SELECT id, title, time_created 
    FROM session 
    WHERE project_id = '854d69f0-9fcb-49df-8567-269794916197' 
    ORDER BY time_created DESC 
    LIMIT 20
  `).all();
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'session-parts') {
  const sessionId = arg;
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
  const keyword = arg;
  const rows = db.prepare(`
    SELECT m.session_id, m.id as msg_id, m.time_created,
           substr(json_extract(m.data, '$.content'), 1, 400) as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
      AND json_extract(m.data, '$.content') LIKE ?
    ORDER BY m.time_created DESC
    LIMIT 15
  `).all(`%${keyword}%`);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'search-user-all') {
  const keyword = arg;
  const rows = db.prepare(`
    SELECT m.session_id, m.id as msg_id, m.time_created,
           substr(json_extract(m.data, '$.content'), 1, 400) as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
      AND json_extract(m.data, '$.content') LIKE ?
    ORDER BY m.time_created DESC
    LIMIT 20
  `).all(`%${keyword}%`);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'recent-assistant-parts') {
  const sessionId = arg;
  const rows = db.prepare(`
    SELECT m.id as msg_id, m.agent_id,
           json_extract(p.data, '$.type') as part_type,
           json_extract(p.data, '$.tool') as tool,
           substr(json_extract(p.data, '$.text'), 1, 500) as text_preview,
           substr(json_extract(p.data, '$.state.output'), 1, 500) as output_preview
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
    ORDER BY m.time_created DESC, p.time_created DESC
    LIMIT 40
  `).all(sessionId);
  console.log(JSON.stringify(rows, null, 2));
} else if (action === 'all-user-content') {
  const sessionId = arg;
  const rows = db.prepare(`
    SELECT m.id as msg_id, m.time_created,
           json_extract(m.data, '$.content') as content
    FROM message m
    WHERE m.session_id = ?
      AND json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created
  `).all(sessionId);
  console.log(JSON.stringify(rows, null, 2));
}

db.close();
