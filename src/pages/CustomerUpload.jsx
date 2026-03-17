import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export function CustomerUpload() {
  const { uniqueCode } = useParams(); // URL se cafe code uthayega
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Client-side Validation: Max 20MB
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      setMessage({ type: 'danger', text: 'File size exceeds 20MB limit!' });
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setProgress(0);

      const response = await api.post(`/api/file/upload/${uniqueCode}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Live Progress Track karne ke liye
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      setMessage({ type: 'success', text: 'File uploaded successfully! The owner has been notified.' });
      setFile(null);
      // Reset input field
      e.target.reset();
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: err.response?.data || 'Upload failed. Please check the Cafe Code.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="mb-4">
            <i className="bi bi-cloud-arrow-up-fill text-primary" style={{ fontSize: '4rem' }}></i>
            <h2 className="fw-bold mt-2">QuickPrint Upload</h2>
            <p className="text-muted">Uploading to Cafe: <span className="fw-bold text-primary">{uniqueCode}</span></p>
          </div>

          <div className="card shadow-sm border-0 p-4">
            {message.text && (
              <div className={`alert alert-${message.type} mb-3`} role="alert">
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <input 
                  type="file" 
                  className="form-control form-control-lg" 
                  onChange={handleFileChange}
                  disabled={uploading}
                  required 
                />
                <div className="form-text mt-2 text-start">
                  Supported formats: PDF, Images, Word, etc. (Max 20MB)
                </div>
              </div>

              {uploading && (
                <div className="mb-4">
                  <div className="progress" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${progress}%` }}
                    >
                      {progress}%
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`btn btn-primary btn-lg w-100 fw-bold ${uploading ? 'disabled' : ''}`}
                disabled={!file || uploading}
              >
                {uploading ? 'Sending File...' : 'Send to Printer'}
                {!uploading && <i className="bi bi-send-fill ms-2"></i>}
              </button>
            </form>
          </div>
          
          <footer className="mt-5 text-muted small">
            Powered by <strong>QuickPrint</strong> - No more long queues!
          </footer>
        </div>
      </div>
    </div>
  );
};
