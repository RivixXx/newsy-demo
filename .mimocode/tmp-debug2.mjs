import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', { readOnly: true });

// Get recent user message parts
const rows = db.prepare(`
  SELECT p.id, p.message_id, p.session_id,
         json_extract(p.data, '$.type') as part_type,
         json_extract(p.data, '$.text') as text,
         substr(p.data, 1, 500) as data_preview
  FROM part p
  JOIN message m ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'user'
  ORDER BY m.time_created DESC
  LIMIT 10
`).all();

console.log(JSON.stringify(rows, null, 2));

db.close();
