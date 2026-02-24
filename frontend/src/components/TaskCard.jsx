import { useDraggable } from '@dnd-kit/core';

function TaskCard({ task, onEdit, onDelete, isDragOverlay }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        disabled: isDragOverlay,
    });

    const style = transform
        ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
        : {};

    const priorityIcon = {
        High: '🔴',
        Medium: '🟡',
        Low: '🟢',
    };

    return (
        <div
            ref={!isDragOverlay ? setNodeRef : undefined}
            className={`task-card ${isDragging ? 'dragging' : ''}`}
            style={{
                ...style,
                ...(isDragOverlay ? { boxShadow: 'var(--shadow-lg)', transform: 'rotate(3deg) scale(1.05)' } : {}),
            }}
            {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
        >
            <div className="task-card-header">
                <span className="task-title">{task.title}</span>
                {!isDragOverlay && (
                    <div className="task-card-actions">
                        <button className="btn-icon" onClick={onEdit} title="Edit task">✏️</button>
                        <button className="btn-icon" onClick={onDelete} title="Delete task">🗑️</button>
                    </div>
                )}
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}

            <div className="task-card-footer">
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {priorityIcon[task.priority]} {task.priority}
                </span>
                {task.assignee_name && (
                    <div className="task-assignee">
                        <div
                            className="assignee-avatar"
                            style={{ background: task.assignee_color || 'var(--accent-primary)' }}
                        >
                            {task.assignee_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="assignee-name">{task.assignee_name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
