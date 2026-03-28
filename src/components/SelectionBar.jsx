import React from "react";

export function SelectionBar({ selectedCount, onDownload, onDelete, onClear }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed-bottom bg-dark text-white p-3 shadow-lg animate__animated animate__slideInUp" style={{ zIndex: 1050 }}>
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-primary rounded-pill fs-6">{selectedCount}</span>
          <span className="fw-bold">Files Selected</span>
        </div>
        
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-2" onClick={onDownload}>
            <i className="bi bi-cloud-arrow-down-fill"></i>
            <span className="d-none d-md-inline">Bulk Download</span>
          </button>
          
          <button className="btn btn-danger btn-sm d-flex align-items-center gap-2" onClick={onDelete}>
            <i className="bi bi-trash3-fill"></i>
            <span className="d-none d-md-inline">Bulk Delete</span>
          </button>
          
          <button className="btn btn-link text-white text-decoration-none btn-sm ms-2" onClick={onClear}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}