import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeModal({ uniqueCode, cafeName }){
  // Yeh woh URL hai jo customer scan karega
  const uploadUrl = `${window.location.origin}/upload/${uniqueCode}`;

  return (
    <div className="modal fade" id="qrModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">Cafe QR Code</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body text-center p-5">
            <h4 className="fw-bold mb-3">{cafeName}</h4>
            <div className="p-3 bg-white d-inline-block shadow-sm rounded">
              <QRCodeSVG value={uploadUrl} size={250} includeMargin={true} />
            </div>
            <p className="mt-4 text-muted">
              Ask customers to scan this code to upload their files directly.
            </p>
            <div className="alert alert-light border small">
              {uploadUrl}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary w-100" onClick={() => window.print()}>
              <i className="bi bi-printer me-2"></i> Print QR Standee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
