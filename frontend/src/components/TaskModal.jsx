import { useState, useEffect } from 'react';

function TaskModal({ task, columnId, columns, users, onSave, onClose }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assigneeId, setAssigneeId] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState(columnId);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'Medium');
            setAssigneeId(task.assignee_id || '');
            setSelectedColumnId(task.column_id);
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            description: description.trim(),
            priority,
            assignee_id: assigneeId ? Number(assigneeId) : null,
            column_id: Number(selectedColumnId),
        });
    };

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <h2>{task ? '✏️ Edit Task' : '➕ Create Task'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="task-title">Title *</label>
                        <input
                            id="task-title"
                            type="text"
                            placeholder="Enter task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-desc">Description</label>
                        <textarea
                            id="task-desc"
                            placeholder="Enter task description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-priority">Priority</label>
                        <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="High">🔴 High</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="Low">🟢 Low</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-assignee">Assignee</label>
                        <select
                            id="task-assignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    {task && (
                        <div className="form-group">
                            <label htmlFor="task-column">Column</label>
                            <select
                                id="task-column"
                                value={selectedColumnId}
                                onChange={(e) => setSelectedColumnId(e.target.value)}
                            >
                                {columns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
