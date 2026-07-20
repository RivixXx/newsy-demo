const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

// Find all sessions for this project
const projectDir = 'D:\\Проекты\\NF\\newsy-demo';
const projectId = '854d69f0-9fcb-49df-8567-269794916197';

const sessions = db.prepare(`
  SELECT id, title, time_created, time_updated
  FROM session
  WHERE project_id = ?
  ORDER BY time_created DESC
`).all(projectId);

console.log(`=== ALL PROJECT SESSIONS (${sessions.length}) ===`);
for (const s of sessions) {
  console.log(`  ${s.id} | ${new Date(s.time_created).toISOString()} | ${s.title.substring(0, 80)}`);
}

// Check for any recent user statements about rules/decisions/preferences across all sessions for this project
const keywords = ['always', 'never', 'remember', 'rule', 'decision', 'decided'];
for (const kw of keywords) {
  const hits = db.prepare(`
    SELECT m.session_id, substr(json_extract(p.data, '$.text'), 1, 300) as text
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND lower(json_extract(p.data, '$.text')) LIKE ?
    ORDER BY m.time_created DESC
    LIMIT 3
  `).all(projectId, `%${kw}%`);
  
  if (hits.length > 0) {
    console.log(`\n=== USER KEYWORD "${kw}" ===`);
    for (const h of hits) {
      console.log(`  [${h.session_id}] ${h.text}`);
    }
  }
}

db.close();
