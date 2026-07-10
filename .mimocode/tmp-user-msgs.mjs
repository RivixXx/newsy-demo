import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', { readOnly: true });

// Get all user messages from the most recent real session
const rows = db.prepare(`
  SELECT p.id, p.message_id,
         json_extract(p.data, '$.text') as text
  FROM part p
  JOIN message m ON p.message_id = m.id
  WHERE m.session_id = 'ses_0ba701ae4ffej94HHqnDgoY1df'
    AND json_extract(m.data, '$.role') = 'user'
    AND json_extract(p.data, '$.type') = 'text'
  ORDER BY m.time_created
`).all();

rows.forEach((r, i) => {
  console.log(`--- User message ${i + 1} ---`);
  console.log(r.text?.substring(0, 300));
  console.log();
});

db.close();
