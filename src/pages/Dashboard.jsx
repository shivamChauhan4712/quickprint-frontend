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

    const socket = new SockJS(`http://192.168.1.139:8080/ws-print`);
    const stompClient = Stomp.over(socket);

    // Disable logging for a cleaner console (Optional)
    // stompClient.debug = null;

    stompClient.connect({}, () => {
      console.log("Connected to WebSocket");

      stompClient.subscribe(`/topic/cafe/${uniqueCode}`, (message) => {
        // console.log("Real-time data received!", message.body);
        const newFile = JSON.parse(message.body);
        // Using functional update to ensure we have the latest state
        setFiles((prevFiles) => {
          // Check karein agar file ID pehle se list mein hai
          const isDuplicate = prevFiles.find((file) => file.id === newFile.id);

          if (isDuplicate) {
            return prevFiles; // Agar duplicate hai toh purani list hi rehne do
          }
          return [newFile, ...prevFiles]; // Agar nayi hai toh add karo
        });
        // alert("New Print Request Received!");
        console.log("New file received real-time:", newFile);
      });
    });

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
  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">Recent Print Requests</h2>
          {/* QR Code Trigger Button */}
          <button
            className="btn btn-dark shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#qrModal"
          >
            <i className="bi bi-qr-code me-2"></i> View QR Code
          </button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-primary text-white">
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Loading files...
                      </td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No pending print requests.
                      </td>
                    </tr>
                  ) : (
                    files
                      .filter((file) => file.status !== "DELETED")
                      .map((file) => (
                        <tr key={file.id}>
                          <td className="fw-bold">{file.originalFileName}</td>
                          <td>
                            <span className="badge bg-secondary text-uppercase small">
                              {file.fileType?.split("/")[1] || "FILE"}
                            </span>
                          </td>
                          <td>{(file.fileSize / 1024).toFixed(2)} KB</td>
                          <td>
                            <span
                              className={`badge ${file.status === "PENDING" ? "bg-warning" : "bg-success"}`}
                            >
                              {file.status}
                            </span>
                          </td>
                          <td className="text-center">
                            {/* Print/Preview Button */}
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => handlePrint(file.id)}
                              title="Print / View File"
                            >
                              <i className="bi bi-printer-fill me-1"></i> Print
                            </button>

                            {/* Download Button */}
                            <button
                              className="btn btn-outline-primary btn-sm me-2"
                              onClick={() =>
                                handleDownload(file.id, file.originalFileName)
                              }
                              title="Download File"
                            >
                              <i className="bi bi-download"></i>
                            </button>

                            {/* Delete Button */}
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(file.id)}
                              title="Delete File"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* QR Code Modal */}
        <QRCodeModal
          uniqueCode={uniqueCode}
          cafeName={localStorage.getItem("cafeName")}
        />
      </div>
    </div>
  );
}
