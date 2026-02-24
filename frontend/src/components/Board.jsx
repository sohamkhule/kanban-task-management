import { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import SearchBar from './SearchBar';
import * as api from '../api/client';

const SOCKET_URL = 'http://localhost:3001';

function Board({ user, onLogout }) {
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [modalColumnId, setModalColumnId] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // Socket connection
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(SOCKET_URL);
        setSocket(s);

        s.on('task:created', (task) => {
            setTasks(prev => [...prev, task]);
        });
        s.on('task:updated', (task) => {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        });
        s.on('task:deleted', (data) => {
            setTasks(prev => prev.filter(t => t.id !== data.id));
        });
        s.on('task:moved', (data) => {
            // Refresh tasks from server for accurate ordering
            api.getTasks().then(res => setTasks(res.data));
        });
        s.on('column:created', (column) => {
            setColumns(prev => [...prev, column]);
        });
        s.on('column:deleted', (data) => {
            setColumns(prev => prev.filter(c => c.id !== data.id));
            api.getTasks().then(res => setTasks(res.data));
        });
        s.on('columns:reordered', (cols) => {
            setColumns(cols);
        });

        return () => s.disconnect();
    }, []);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [colsRes, tasksRes, usersRes] = await Promise.all([
                    api.getColumns(),
                    api.getTasks(),
                    api.getUsers(),
                ]);
                setColumns(colsRes.data);
                setTasks(tasksRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    // Filter tasks by search
    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;
        const q = searchQuery.toLowerCase();
        return tasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.assignee_name && t.assignee_name.toLowerCase().includes(q)) ||
            t.priority.toLowerCase().includes(q)
        );
    }, [tasks, searchQuery]);

    // Column colors
    const getColumnColor = useCallback((title, index) => {
        const colorMap = {
            'to do': 'var(--col-todo)',
            'in progress': 'var(--col-progress)',
            'in review': 'var(--col-review)',
            'done': 'var(--col-done)',
        };
        return colorMap[title.toLowerCase()] || 'var(--col-custom)';
    }, []);

    // Task handlers
    const handleCreateTask = useCallback(async (taskData) => {
        try {
            const res = await api.createTask(taskData);
            setTasks(prev => [...prev, res.data]);
            socket?.emit('task:created', res.data);
            setModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    }, [socket]);

    const handleUpdateTask = useCallback(async (taskData) => {
        try {
            const res = await api.updateTask(editingTask.id, taskData);
            setTasks(prev => prev.map(t => t.id === res.data.id ? res.data : t));
            socket?.emit('task:updated', res.data);
            setModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    }, [editingTask, socket]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            await api.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            socket?.emit('task:deleted', { id: taskId });
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    }, [socket]);

    // Drag and Drop
    const handleDragStart = useCallback((event) => {
        const task = tasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    }, [tasks]);

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        let targetColumnId;

        // Check if dropped over a column or a task
        if (String(over.id).startsWith('column-')) {
            targetColumnId = Number(String(over.id).replace('column-', ''));
        } else {
            // Dropped over another task - find that task's column
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) targetColumnId = overTask.column_id;
        }

        if (!targetColumnId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Calculate new order
        const tasksInColumn = tasks.filter(t => t.column_id === targetColumnId && t.id !== taskId);
        const newOrder = tasksInColumn.length;

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, column_id: targetColumnId, order: newOrder } : t
        ));

        try {
            const res = await api.moveTask(taskId, { column_id: targetColumnId, order: newOrder });
            socket?.emit('task:moved', { id: taskId, column_id: targetColumnId, order: newOrder });
            // Refresh for accurate ordering
            const tasksRes = await api.getTasks();
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to move task:', err);
            // Revert
            const tasksRes = await api.getTasks();
            setTasks(tasksRes.data);
        }
    }, [tasks, socket]);

    // Column handlers
    const handleAddColumn = useCallback(async () => {
        const title = prompt('Enter column name:');
        if (!title || !title.trim()) return;

        try {
            const res = await api.createColumn(title.trim());
            setColumns(prev => [...prev, res.data]);
            socket?.emit('column:created', res.data);
        } catch (err) {
            console.error('Failed to create column:', err);
        }
    }, [socket]);

    const handleDeleteColumn = useCallback(async (colId) => {
        if (!confirm('Delete this column? Tasks will be moved to "To Do".')) return;
        try {
            await api.deleteColumn(colId);
            setColumns(prev => prev.filter(c => c.id !== colId));
            socket?.emit('column:deleted', { id: colId });
            // Refresh tasks since they moved
            const tasksRes = await api.getTasks();
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to delete column:', err);
            alert(err.response?.data?.error || 'Cannot delete this column');
        }
    }, [socket]);

    // Open modal for creating/editing
    const openCreateModal = useCallback((columnId) => {
        setEditingTask(null);
        setModalColumnId(columnId);
        setModalOpen(true);
    }, []);

    const openEditModal = useCallback((task) => {
        setEditingTask(task);
        setModalColumnId(task.column_id);
        setModalOpen(true);
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading board...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <span className="logo">📋</span>
                    <h1>Kanban Board</h1>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <div className="user-avatar" style={{ background: user.avatar_color || 'var(--accent-primary)' }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.name}</span>
                    </div>
                    <button className="btn-logout" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {/* Search + Add Column */}
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddColumn={handleAddColumn}
            />

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="board-container">
                    {columns.map((col, idx) => (
                        <Column
                            key={col.id}
                            column={col}
                            tasks={filteredTasks.filter(t => t.column_id === col.id)}
                            color={getColumnColor(col.title, idx)}
                            onAddTask={() => openCreateModal(col.id)}
                            onEditTask={openEditModal}
                            onDeleteTask={handleDeleteTask}
                            onDeleteColumn={col.is_default ? null : () => handleDeleteColumn(col.id)}
                        />
                    ))}

                    {/* Add Column Card */}
                    <div className="add-column-card" onClick={handleAddColumn}>
                        <span>+ Add Column</span>
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard task={activeTask} isDragOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            {modalOpen && (
                <TaskModal
                    task={editingTask}
                    columnId={modalColumnId}
                    columns={columns}
                    users={users}
                    onSave={editingTask ? handleUpdateTask : handleCreateTask}
                    onClose={() => { setModalOpen(false); setEditingTask(null); }}
                />
            )}
        </div>
    );
}

export default Board;
