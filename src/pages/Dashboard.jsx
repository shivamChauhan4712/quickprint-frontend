import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Navbar } from "../components/Navbar";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { QRCodeModal } from "../components/QRCodeModal";
import Swal from "sweetalert2";
import { SearchBar } from "../components/SearchBar";
import { FileItem } from "../components/FileItem";
import { FilterBadges } from "../components/FilterBadges";

export function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 6; // <- no. of cards per page

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
  async function handleDownload(fileId, fileName) {
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
      window.URL.revokeObjectURL(url);

      try {
        // update status to DOWNLOADED in backend
        await api.patch(`/api/file/${fileId}/status`, null, {
          params: { status: "DOWNLOADED" },
        });

        // update status in UI immediately
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, status: "DOWNLOADED" } : f,
          ),
        );
        console.log("Status updated to DOWNLOADED for file:", fileName);
      } catch (StatusErr) {
        console.error("File downloaded but status update failed:", StatusErr);
      }
    } catch (err) {
      console.error("Download error:", err);
      Swal.fire("Error", "Could not download the file.", "error");
    }
  }

  // 4. Delete File Logic
  async function handleDelete(id) {
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
        await api.delete(`/api/file/delete/${id}`);

        // Instantly remove from UI
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "This file has been successfully removed.",
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
  }

  async function handlePrint(fileId) {
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
  }

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
  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    // Logic: Logarithm for determining the index of the size unit
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // formatting size (2 decimal points)
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getFileTypeLabel(type) {
    if (type?.includes("wordprocessingml")) return "DOCX";
    if (type?.includes("spreadsheetml")) return "EXCEL";
    if (type?.includes("presentationml")) return "PPTX";
    return type?.split("/")[1]?.toUpperCase() || "FILE";
  }

  // Purely Visual Preview
  function renderPreview(file) {
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
          {getFileTypeLabel(file.fileType)} • {formatFileSize(file.fileSize)}
        </span>
      </div>
    );
  }

  const filteredFiles = files.filter((file) => {
    // 1. Search Logic: Does the file name match the search term?
    const matchesSearch = file.originalFileName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Status Logic: Does the file status match the selected badge?
    // (If the statusFilter is set to "ALL", matchesStatus should always be true.)
    const matchesStatus =
      statusFilter === "ALL" || file.status === statusFilter;

    // 3. Final Return: The file must not be "DELETED", and both conditions (Search + Status) must be met.
    return file.status !== "DELETED" && matchesSearch && matchesStatus;
  });

  // Pagination Calculation
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  // while search go back to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

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
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterBadges
          files={files}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              <i
                className={`bi ${searchTerm ? "bi-search" : "bi-inbox"} display-1`}
              ></i>
              <p className="mt-3 fs-5">
                {searchTerm
                  ? `No files found matching "${searchTerm}"`
                  : "No pending print requests."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-link text-primary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            currentFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                getFileIcon={getFileIcon}
                renderPreview={renderPreview}
                handlePrint={handlePrint}
                handleDownload={handleDownload}
                handleDelete={handleDelete}
                formatFileSize={formatFileSize}
              />
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <nav>
              <ul className="pagination shadow-sm">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        <QRCodeModal
          uniqueCode={uniqueCode}
          cafeName={localStorage.getItem("cafeName")}
        />
      </div>
    </div>
  );
}
