
import React from 'react';

export default function DocumentViewer({ file, isProcessing, onReset }) {
  const getFilePreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={URL.createObjectURL(file)} 
          alt="Document preview" 
          className="document-preview"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="pdf-placeholder">
          <div className="pdf-icon">📄</div>
          <p>PDF Document</p>
          <small>{file.name}</small>
        </div>
      );
    } else {
      return (
        <div className="file-placeholder">
          <div className="file-icon">📄</div>
          <p>{file.name}</p>
          <small>{file.type}</small>
        </div>
      );
    }
  };

  return (
    <div className="document-viewer">
      <div className="document-header">
        <h3>Document Preview</h3>
        <button className="reset-button" onClick={onReset}>
          ↻ Upload New
        </button>
      </div>
      
      <div className="document-content">
        {getFilePreview()}
        
        {isProcessing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Processing document...</p>
          </div>
        )}
      </div>
      
      <div className="document-info">
        <div className="info-item">
          <strong>File Name:</strong> {file.name}
        </div>
        <div className="info-item">
          <strong>File Size:</strong> {(file.size / 1024).toFixed(2)} KB
        </div>
        <div className="info-item">
          <strong>File Type:</strong> {file.type || 'Unknown'}
        </div>
      </div>
    </div>
  );
}
