const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\Михаил\\.local\\share\\mimocode\\mimocode.db', {readOnly:true});

// List tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("=== TABLES ===");
console.log(JSON.stringify(tables.map(r=>r.name)));

// Get session schema
const sessionSchema = db.prepare("SELECT sql FROM sqlite_master WHERE name='session'").all();
console.log("\n=== SESSION SCHEMA ===");
console.log(JSON.stringify(sessionSchema));

// List sessions
const sessions = db.prepare("SELECT * FROM session ORDER BY time_created DESC LIMIT 20").all();
console.log("\n=== RECENT SESSIONS (last 20) ===");
console.log(JSON.stringify(sessions.map(s => ({id: s.id, directory: s.directory, title: s.title, time_created: s.time_created})), null, 2));

db.close();
