import React from "react";

export function FilterBadges({ files, statusFilter, setStatusFilter }) {
  // Status definitions with icons
  const badges = [
    { id: "ALL", label: "All Files", icon: "bi-grid-fill" },
    { id: "PENDING", label: "Pending", icon: "bi-clock-history" },
    { id: "DOWNLOADED", label: "Downloaded", icon: "bi-cloud-check" },
    { id: "PRINTED", label: "Printed", icon: "bi-check-all" },
    { id: "FAILED", label: "Failed", icon: "bi-exclamation-octagon" },
  ];

  // Helper to count files for each status
  const getCount = (id) => {
    if (id === "ALL") return files.filter((f) => f.status !== "DELETED").length;
    return files.filter((f) => f.status === id).length;
  };

  return (
    <div className="d-flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar px-1">
      {badges.map((badge) => {
        const isActive = statusFilter === badge.id;
        const count = getCount(badge.id);

        return (
          <button
            key={badge.id}
            onClick={() => setStatusFilter(badge.id)}
            className={`btn btn-sm rounded-pill px-3 py-2 border-0 shadow-sm transition-all d-flex align-items-center gap-2 ${
              isActive
                ? "btn-dark text-white shadow" // Active Style
                : "btn-white text-muted bg-white border" // Inactive Style
            }`}
            style={{ 
                whiteSpace: "nowrap",
                transition: "all 0.3s ease" 
            }}
          >
            <i className={`bi ${badge.icon}`}></i>
            <span className="fw-semibold">{badge.label}</span>
            
            {/* Dynamic Count Badge */}
            <span 
              className={`badge rounded-pill px-2 ${
                isActive 
                  ? "bg-light text-dark" 
                  : "bg-secondary bg-opacity-10 text-muted"
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}