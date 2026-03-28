export function FileItem({
  file,
  toggleSelect,
  isSelected,
  getFileIcon,
  renderPreview,
  handlePrint,
  handleDownload,
  handleDelete,
  formatFileSize,
}) {
  const fileInfo = getFileIcon(file.fileType);
  return (
    <div key={file.id} className="col-12 col-md-6 col-lg-4 position-relative">
      {/* Checkbox Overlay */}
      <div
        className="position-absolute top-0 start-0 m-3"
        style={{ zIndex: 100 }}
      >
        <input
          type="checkbox"
          className="form-check-input shadow-sm border-primary p-2 cursor-pointer"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(file.id);
          }}
          style={{ width: "1.4rem", height: "1.4rem" }}
        />
      </div>
      <div className="card h-100 border-0 shadow-sm hover-shadow transition overflow-hidden">
        {/* 1. Preview Section */}
        <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center border-bottom">
          {renderPreview(file)}
        </div>

        <div className="card-body p-4">
          {/* 2. File Name Section */}
          <div className="d-flex align-items-center mb-3">
            <div
              className={`${fileInfo.bg} bg-opacity-10 p-2 rounded-3 me-3 ${fileInfo.color}`}
            >
              <i className={`bi ${fileInfo.icon} h4 mb-0`}></i>
            </div>
            <div className="overflow-hidden">
              <h6
                className="fw-bold mb-0 text-truncate"
                title={file.originalFileName}
              >
                {file.originalFileName}
              </h6>
              <small className="text-muted text-uppercase">
                {formatFileSize(file.fileSize)}
              </small>
            </div>
          </div>

          {/* 3. Status Badge */}
          <div className="mb-4">
            <span
              className={`badge rounded-pill ${
                file.status === "PENDING"
                  ? "bg-warning text-dark"
                  : file.status === "FAILED"
                    ? "bg-danger"
                    : "bg-success"
              }`}
            >
              <i
                className={`bi ${
                  file.status === "PENDING"
                    ? "bi-clock"
                    : file.status === "FAILED"
                      ? "bi-exclamation-triangle"
                      : "bi-check-circle"
                } me-1`}
              ></i>
              {file.status}
            </span>
          </div>

          {/* 4. Action Buttons */}
          <div className="d-flex gap-2 border-top pt-3">
            <button
              className="btn btn-primary btn-sm flex-grow-1"
              onClick={() => handlePrint(file.id)}
            >
              <i className="bi bi-printer-fill me-1"></i> Print
            </button>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => handleDownload(file.id, file.originalFileName)}
            >
              <i className="bi bi-download"></i>
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(file.id)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
