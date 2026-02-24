# Kanban Task Management System

A full-stack Kanban board application built with React, Node.js, Express, SQLite, and Socket.io.

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

## How to Run Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/sohamkhule/kanban-task-management.git
cd kanban-task-management
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

### Step 4: Start the Backend Server

In the **backend** terminal:

```bash
cd backend
npm start
```

> Backend API runs on **http://localhost:3001**

### Step 5: Start the Frontend Dev Server

In the **frontend** terminal:

```bash
cd frontend
npm run dev
```

> Frontend runs on **http://localhost:5173**

### Step 6: Open the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## Environment Variables

No `.env` file is required. The app runs with default settings:

| Variable | Default Value | Description |
|---|---|---|
| PORT | 3001 | Backend server port |
| Frontend Port | 5173 | Vite dev server port |

---

## Login Credentials

Use any of the following hardcoded credentials to log in:

| Email | Password | Name |
|---|---|---|
| admin@kanban.com | admin123 | Admin User |
| soham@kanban.com | soham123 | Soham Khule |
| john@kanban.com | john123 | John Doe |
| jane@kanban.com | jane123 | Jane Smith |
| mike@kanban.com | mike123 | Mike Johnson |

---

## Features

- ✅ **Authentication** — Login with hardcoded credentials, JWT session persisted in localStorage
- ✅ **Kanban Board** — 4 fixed columns: To Do, In Progress, In Review, Done
- ✅ **Task CRUD** — Create, Edit, Delete tasks with Priority (High/Medium/Low) and Assignee
- ✅ **Drag & Drop** — Drag task cards across columns, position persists after page refresh
- ✅ **Real-time Search** — Filter tasks by title, description, assignee, or priority
- ✅ **WebSocket Sync** — Real-time sync across multiple browser tabs using Socket.io
- ✅ **Custom Columns** — Create and delete additional columns beyond the 4 defaults

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Drag & Drop | @dnd-kit/core |
| Styling | Vanilla CSS (Dark Glassmorphism Theme) |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Real-time | Socket.io |
| Auth | JWT + localStorage |

---

## Project Structure

```
├── backend/
│   ├── db/
│   │   └── database.js        # SQLite schema + seed data
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Login + users list endpoints
│   │   ├── tasks.js           # Task CRUD + move endpoints
│   │   └── columns.js         # Column CRUD + reorder endpoints
│   ├── socket.js              # WebSocket event handlers
│   ├── server.js              # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js      # Axios API client
│   │   ├── components/
│   │   │   ├── LoginPage.jsx  # Login screen
│   │   │   ├── Board.jsx      # Main Kanban board
│   │   │   ├── Column.jsx     # Droppable column
│   │   │   ├── TaskCard.jsx   # Draggable task card
│   │   │   ├── TaskModal.jsx  # Create/Edit task modal
│   │   │   └── SearchBar.jsx  # Real-time search
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```
