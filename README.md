# Kanban Task Management System

A full-stack Kanban board application built with React, Node.js, Express, SQLite, and Socket.io.

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

Backend runs on **http://localhost:3001**

### 4. Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

## Login Credentials

| Email | Password |
|---|---|
| admin@kanban.com | admin123 |
| soham@kanban.com | soham123 |
| john@kanban.com | john123 |
| jane@kanban.com | jane123 |
| mike@kanban.com | mike123 |

## Features

- ✅ **Authentication** — Login with hardcoded credentials, JWT session persistence
- ✅ **Kanban Board** — 4 fixed columns (To Do, In Progress, In Review, Done)
- ✅ **Task CRUD** — Create, Edit, Delete tasks with Priority (High/Medium/Low) and Assignee
- ✅ **Drag & Drop** — Move task cards across columns, persists after page refresh
- ✅ **Real-time Search** — Filter tasks by title, description, assignee, or priority
- ✅ **WebSocket Sync** — Changes sync in real-time across browser tabs
- ✅ **Custom Columns** — Create and delete additional columns beyond the 4 defaults

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Drag & Drop | @dnd-kit/core |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Real-time | Socket.io |
| Auth | JWT + localStorage |
