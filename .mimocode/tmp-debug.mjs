import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', { readOnly: true });

// Get a few recent user messages to understand the data format
const rows = db.prepare(`
  SELECT m.id, m.session_id, json_extract(m.data, '$.role') as role,
         json_extract(m.data, '$.content') as content,
         json_extract(m.data, '$.type') as type,
         length(json_extract(m.data, '$.content')) as content_len
  FROM message m
  WHERE json_extract(m.data, '$.role') = 'user'
  ORDER BY m.time_created DESC
  LIMIT 5
`).all();

console.log(JSON.stringify(rows, null, 2));

db.close();
