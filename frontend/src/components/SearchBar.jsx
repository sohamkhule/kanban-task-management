function SearchBar({ searchQuery, onSearchChange, onAddColumn }) {
    return (
        <div className="search-bar-container">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search tasks by title, description, assignee, or priority..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    id="search-bar"
                />
            </div>
            <button className="btn btn-secondary add-column-btn" onClick={onAddColumn}>
                + New Column
            </button>
        </div>
    );
}

export default SearchBar;
