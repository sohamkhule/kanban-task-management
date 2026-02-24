import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

function Column({ column, tasks, color, onAddTask, onEditTask, onDeleteTask, onDeleteColumn }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
    });

    return (
        <div className={`column ${isOver ? 'drag-over' : ''}`}>
            <div className="column-header">
                <div className="column-header-left">
                    <div className="column-dot" style={{ background: color }}></div>
                    <span className="column-title">{column.title}</span>
                    <span className="column-count">{tasks.length}</span>
                </div>
                <div className="column-header-actions">
                    {onDeleteColumn && (
                        <button
                            className="btn-icon"
                            onClick={onDeleteColumn}
                            title="Delete column"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div ref={setNodeRef} className={`column-body ${tasks.length === 0 ? 'empty' : ''}`}>
                {tasks.length === 0 ? (
                    <p className="column-empty">No tasks yet</p>
                ) : (
                    tasks
                        .sort((a, b) => a.order - b.order)
                        .map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={() => onEditTask(task)}
                                onDelete={() => onDeleteTask(task.id)}
                            />
                        ))
                )}
            </div>

            <button className="add-task-btn" onClick={onAddTask}>
                + Add Task
            </button>
        </div>
    );
}

export default Column;
