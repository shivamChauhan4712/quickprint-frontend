import React from "react";

export function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-4">
      <div className="input-group shadow-sm rounded-3 overflow-hidden border">
        <span className="input-group-text bg-white border-0 text-muted">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control border-0 ps-0 py-2 shadow-none"
          placeholder="Search files by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="btn btn-white border-0 text-danger" 
            onClick={() => setSearchTerm("")}
            title="Clear Search"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="ps-2 mt-1">
          <small className="text-muted italic">
            Showing results for: <strong>"{searchTerm}"</strong>
          </small>
        </div>
      )}
    </div>
  );
}