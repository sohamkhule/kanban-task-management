const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/columns - get all columns
router.get('/', (req, res) => {
    const columns = db.prepare('SELECT * FROM columns ORDER BY "order" ASC').all();
    res.json(columns);
});

// POST /api/columns - create a custom column
router.post('/', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const maxOrder = db.prepare('SELECT MAX("order") as max_order FROM columns').get();
    const order = (maxOrder.max_order ?? -1) + 1;

    const result = db.prepare('INSERT INTO columns (title, "order", is_default) VALUES (?, ?, 0)').run(title, order);
    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(column);
});

// DELETE /api/columns/:id - delete a custom column (not defaults)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const col = db.prepare('SELECT * FROM columns WHERE id = ?').get(id);

    if (!col) {
        return res.status(404).json({ error: 'Column not found' });
    }
    if (col.is_default) {
        return res.status(400).json({ error: 'Cannot delete default columns' });
    }

    // Move tasks in this column to "To Do" (column id 1)
    db.prepare('UPDATE tasks SET column_id = 1 WHERE column_id = ?').run(id);
    db.prepare('DELETE FROM columns WHERE id = ?').run(id);

    res.json({ success: true, id: Number(id) });
});

// PATCH /api/columns/reorder - reorder columns
router.patch('/reorder', (req, res) => {
    const { columnOrder } = req.body; // array of { id, order }

    if (!Array.isArray(columnOrder)) {
        return res.status(400).json({ error: 'columnOrder must be an array' });
    }

    const update = db.prepare('UPDATE columns SET "order" = ? WHERE id = ?');
    const reorder = db.transaction(() => {
        for (const col of columnOrder) {
            update.run(col.order, col.id);
        }
    });
    reorder();

    const columns = db.prepare('SELECT * FROM columns ORDER BY "order" ASC').all();
    res.json(columns);
});

module.exports = router;
