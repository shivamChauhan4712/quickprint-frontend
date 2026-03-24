import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Navbar } from "../components/Navbar";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { QRCodeModal } from "../components/QRCodeModal";
import Swal from "sweetalert2";

export function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const uniqueCode = localStorage.getItem("uniqueCode");

  // 1. Fetch all files for this cafe
  const fetchFiles = async () => {
    try {
      const response = await api.get(`/api/file/list/${uniqueCode}`);
      setFiles(response.status === 204 ? [] : response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. WebSocket & Initial Load
  useEffect(() => {
    fetchFiles();

    const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws-print`);
    const stompClient = Stomp.over(socket);

    // Disable logging for a cleaner console (Optional)
    // stompClient.debug = null;

    stompClient.connect(
      {},
      () => {
        console.log("Connected to WebSocket");

        stompClient.subscribe(`/topic/cafe/${uniqueCode}`, (message) => {
          try {
            if (message && message.body) {
              const newFile = JSON.parse(message.body);

              setFiles((prevFiles) => {
                // Check for duplicates
                const isDuplicate = prevFiles.some(
                  (file) => file.id === newFile.id,
                );
                if (isDuplicate) return prevFiles;

                console.log("New file received real-time:", newFile);

                return [newFile, ...prevFiles];
              });
            }
          } catch (err) {
            console.error("Error parsing socket message:", err);
          }
        });
      },
      (error) => {
        console.error("WebSocket Connection Error:", error);
      },
    );

    // Correct Cleanup Logic
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("WebSocket Disconnected");
        });
      }
    };
  }, [uniqueCode]);

  // 3. Download File Logic
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/api/file/download/${fileId}`, {
        responseType: "blob", // Important for file downloads
      });

      // Create a temporary link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error downloading file. Please try again.");
    }
  };

  // 4. Delete File Logic
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This file will be hidden from the dashboard.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Backend status update to DELETED
        await api.patch(`/api/file/${id}/status`, null, {
          params: { status: "DELETED" },
        });

        // Instantly remove from UI
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "The file has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire(
          "Error",
          "Failed to delete the file. Please try again.",
          "error",
        );
      }
    }
  };

  const handlePrint = async (fileId) => {
    try {
      const response = await api.get(`/api/file/download/${fileId}`, {
        responseType: "blob",
      });

      const file = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const fileURL = URL.createObjectURL(file);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = fileURL;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Confirmation popup after print dialog closes
        setTimeout(async () => {
          const result = await Swal.fire({
            title: "Confirm Print Status",
            text: "Has the document been printed successfully?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#dc3545",
            confirmButtonText: "Yes, Printed",
            cancelButtonText: "No, Cancel",
            allowOutsideClick: false,
          });

          if (result.isConfirmed) {
            try {
              // Update backend status to PRINTED
              await api.patch(`/api/file/${fileId}/status`, null, {
                params: { status: "PRINTED" },
              });

              // Update UI state immediately
              setFiles((prevFiles) =>
                prevFiles.map((f) =>
                  f.id === fileId ? { ...f, status: "PRINTED" } : f,
                ),
              );

              Swal.fire({
                title: "Updated!",
                text: "The file status has been set to PRINTED.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            } catch (err) {
              console.error("Status update failed:", err);
              Swal.fire(
                "Error",
                "Failed to update status in the database.",
                "error",
              );
            }
          }

          // Cleanup resources
          document.body.removeChild(iframe);
          URL.revokeObjectURL(fileURL);
        }, 1000);
      };
    } catch (err) {
      console.error("Print error:", err);
      Swal.fire(
        "Download Error",
        "Could not load the file for printing.",
        "error",
      );
    }
  };

  function getFileIcon(type) {
    const fileType = type?.toLowerCase() || "";
    if (fileType.includes("image"))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "text-info",
        bg: "bg-info",
      };
    if (fileType.includes("pdf"))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "text-danger",
        bg: "bg-danger",
      };
    if (
      fileType.includes("word") ||
      fileType.includes("officedocument.wordprocessingml")
    )
      return {
        icon: "bi-file-earmark-word-fill",
        color: "text-primary",
        bg: "bg-primary",
      };
    if (
      fileType.includes("excel") ||
      fileType.includes("spreadsheetml") ||
      fileType.includes("csv")
    )
      return {
        icon: "bi-file-earmark-spreadsheet-fill",
        color: "text-success",
        bg: "bg-success",
      };
    if (fileType.includes("presentationml") || fileType.includes("powerpoint"))
      return {
        icon: "bi-file-earmark-ppt-fill",
        color: "text-warning",
        bg: "bg-warning",
      };
    return {
      icon: "bi-file-earmark-fill",
      color: "text-secondary",
      bg: "bg-secondary",
    };
  }

  // Purely Visual Preview
  const renderPreview = (file) => {
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/api/file/download/${file.id}`;
    const type = file.fileType?.toLowerCase() || "";
    const fileInfo = getFileIcon(type);

    if (type.includes("image")) {
      return (
        <img
          src={fileUrl}
          className="img-fluid object-fit-cover h-100 w-100"
          alt="preview"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = `<i class="bi ${fileInfo.icon} display-1 ${fileInfo.color}"></i>`;
          }}
        />
      );
    }

    // Document Preview
    return (
      <div
        className={`w-100 h-100 d-flex flex-column align-items-center justify-content-center ${fileInfo.bg} bg-opacity-10`}
      >
        <i className={`bi ${fileInfo.icon} ${fileInfo.color} display-1`}></i>
        <span className={`fw-bold mt-2 text-uppercase small ${fileInfo.color}`}>
          {file.fileType?.includes("wordprocessingml")
            ? "DOCX"
            : file.fileType?.includes("spreadsheetml")
              ? "EXCEL"
              : file.fileType?.includes("presentationml")
                ? "PPTX"
                : file.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">Recent Print Requests</h2>
          <button
            className="btn btn-dark shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#qrModal"
          >
            <i className="bi bi-qr-code me-2"></i> View QR Code
          </button>
        </div>

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="bi bi-inbox text-muted h1"></i>
              <p className="text-muted mt-2">No pending print requests.</p>
            </div>
          ) : (
            files
              .filter((file) => file.status !== "DELETED")
              .map((file) => {
                const fileInfo = getFileIcon(file.fileType);
                return (
                  <div key={file.id} className="col-12 col-md-6 col-lg-4">
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
                              {(file.fileSize / 1024).toFixed(2)} KB
                            </small>
                          </div>
                        </div>

                        {/* 3. Status Badge */}
                        <div className="mb-4">
                          <span
                            className={`badge rounded-pill ${file.status === "PENDING" ? "bg-warning text-dark" : "bg-success"}`}
                          >
                            <i
                              className={`bi ${file.status === "PENDING" ? "bi-clock" : "bi-check-circle"} me-1`}
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
                            onClick={() =>
                              handleDownload(file.id, file.originalFileName)
                            }
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
              })
          )}
        </div>

        <QRCodeModal
          uniqueCode={uniqueCode}
          cafeName={localStorage.getItem("cafeName")}
        />
      </div>
    </div>
  );
}
