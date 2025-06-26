
import React, { useRef, useState } from 'react';

export default function FileUpload({ onFileUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    
    if (allowedTypes.includes(file.type)) {
      onFileUpload(file);
    } else {
      alert('Please upload a PDF, image, or text file.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="upload-container">
      <div 
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h2>Upload Document</h2>
          <p>Drag and drop your document here, or click to browse</p>
          <button 
            className="upload-button"
            onClick={handleButtonClick}
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <div className="supported-formats">
            <small>Supported formats: PDF, JPG, PNG, GIF, TXT</small>
          </div>
        </div>
      </div>
    </div>
  );
}
