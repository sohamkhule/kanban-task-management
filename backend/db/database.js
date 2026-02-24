const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'kanban.db'));

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_default INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('High', 'Medium', 'Low')),
    assignee_id INTEGER,
    column_id INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
  );
`);

// Seed users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, avatar_color) VALUES (?, ?, ?, ?)');
  const seedUsers = db.transaction(() => {
    insertUser.run('Admin User', 'admin@kanban.com', 'admin123', '#6366f1');
    insertUser.run('Soham Khule', 'soham@kanban.com', 'soham123', '#ec4899');
    insertUser.run('John Doe', 'john@kanban.com', 'john123', '#14b8a6');
    insertUser.run('Jane Smith', 'jane@kanban.com', 'jane123', '#f59e0b');
    insertUser.run('Mike Johnson', 'mike@kanban.com', 'mike123', '#ef4444');
  });
  seedUsers();
}

// Seed default columns if empty
const colCount = db.prepare('SELECT COUNT(*) as count FROM columns').get();
if (colCount.count === 0) {
  const insertCol = db.prepare('INSERT INTO columns (title, "order", is_default) VALUES (?, ?, ?)');
  const seedCols = db.transaction(() => {
    insertCol.run('To Do', 0, 1);
    insertCol.run('In Progress', 1, 1);
    insertCol.run('In Review', 2, 1);
    insertCol.run('Done', 3, 1);
  });
  seedCols();
}

// Seed sample tasks if empty
const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (taskCount.count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (title, description, priority, assignee_id, column_id, "order") VALUES (?, ?, ?, ?, ?, ?)');
  const seedTasks = db.transaction(() => {
    insertTask.run('Setup project structure', 'Initialize the monorepo with backend and frontend', 'High', 1, 1, 0);
    insertTask.run('Design database schema', 'Create tables for users, tasks, and columns', 'High', 2, 1, 1);
    insertTask.run('Implement authentication', 'Add login with JWT tokens', 'Medium', 3, 2, 0);
    insertTask.run('Build Kanban board UI', 'Create the drag and drop board interface', 'High', 4, 2, 1);
    insertTask.run('Add search functionality', 'Real-time search filter for task cards', 'Medium', 5, 3, 0);
    insertTask.run('Write documentation', 'Create README with setup instructions', 'Low', 1, 4, 0);
  });
  seedTasks();
}

module.exports = db;
