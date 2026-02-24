const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { setupSocket } = require('./socket');

// Initialize database (creates tables + seeds data)
require('./db/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/columns', require('./routes/columns'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Kanban API running on http://localhost:${PORT}`);
});
