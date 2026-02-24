const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/tasks - get all tasks with assignee info
router.get('/', (req, res) => {
    const tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    ORDER BY t."order" ASC
  `).all();
    res.json(tasks);
});

// POST /api/tasks - create a new task
router.post('/', (req, res) => {
    const { title, description, priority, assignee_id, column_id } = req.body;

    if (!title || !column_id) {
        return res.status(400).json({ error: 'Title and column_id are required' });
    }

    // Get max order in the target column
    const maxOrder = db.prepare('SELECT MAX("order") as max_order FROM tasks WHERE column_id = ?').get(column_id);
    const order = (maxOrder.max_order ?? -1) + 1;

    const result = db.prepare(
        'INSERT INTO tasks (title, description, priority, assignee_id, column_id, "order") VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, description || '', priority || 'Medium', assignee_id || null, column_id, order);

    const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

    res.status(201).json(task);
});

// PUT /api/tasks/:id - update a task
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, priority, assignee_id, column_id } = req.body;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare(`
    UPDATE tasks SET title = ?, description = ?, priority = ?, assignee_id = ?, column_id = ?
    WHERE id = ?
  `).run(
        title ?? existing.title,
        description ?? existing.description,
        priority ?? existing.priority,
        assignee_id !== undefined ? assignee_id : existing.assignee_id,
        column_id ?? existing.column_id,
        id
    );

    const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.id = ?
  `).get(id);

    res.json(task);
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ success: true, id: Number(id) });
});

// PATCH /api/tasks/:id/move - move a task to a different column/position
router.patch('/:id/move', (req, res) => {
    const { id } = req.params;
    const { column_id, order } = req.body;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task's column and order
    db.prepare('UPDATE tasks SET column_id = ?, "order" = ? WHERE id = ?').run(column_id, order, id);

    // Reorder other tasks in the target column
    const tasksInColumn = db.prepare(
        'SELECT id FROM tasks WHERE column_id = ? AND id != ? ORDER BY "order" ASC'
    ).all(column_id, id);

    const reorder = db.prepare('UPDATE tasks SET "order" = ? WHERE id = ?');
    const reorderAll = db.transaction(() => {
        let idx = 0;
        for (const t of tasksInColumn) {
            if (idx === order) idx++; // skip the position for the moved task
            reorder.run(idx, t.id);
            idx++;
        }
    });
    reorderAll();

    const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.id = ?
  `).get(id);

    res.json(task);
});

module.exports = router;
