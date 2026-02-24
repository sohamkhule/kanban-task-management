function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Task events - broadcast to all OTHER clients
        socket.on('task:created', (task) => {
            socket.broadcast.emit('task:created', task);
        });

        socket.on('task:updated', (task) => {
            socket.broadcast.emit('task:updated', task);
        });

        socket.on('task:deleted', (data) => {
            socket.broadcast.emit('task:deleted', data);
        });

        socket.on('task:moved', (data) => {
            socket.broadcast.emit('task:moved', data);
        });

        // Column events
        socket.on('column:created', (column) => {
            socket.broadcast.emit('column:created', column);
        });

        socket.on('column:deleted', (data) => {
            socket.broadcast.emit('column:deleted', data);
        });

        socket.on('columns:reordered', (columns) => {
            socket.broadcast.emit('columns:reordered', columns);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

module.exports = { setupSocket };
