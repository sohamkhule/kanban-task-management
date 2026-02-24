import { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Board from './components/Board';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('kanban_token');
        const savedUser = localStorage.getItem('kanban_user');
        if (token && savedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = useCallback((token, userData) => {
        localStorage.setItem('kanban_token', token);
        localStorage.setItem('kanban_user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('kanban_token');
        localStorage.removeItem('kanban_user');
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <Board user={user} onLogout={handleLogout} />;
}

export default App;
