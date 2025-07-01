import React, { useState, useEffect } from "react";
import {
  uploadDocument,
  uploadMultipleDocuments,
  extractDocument,
  classifyDocument,
  routeDocument,
  listDocuments,
} from "../api";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".msg",
  ".eml",
];

function getFileExtension(filename) {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex > 0 ? filename.slice(lastDotIndex).toLowerCase() : "";
}

export default function Ingest() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [folderDragActive, setFolderDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeTab, setActiveTab] = useState('files'); // 'files' or 'folders'
  const fileInputRef = React.useRef();
  const folderInputRef = React.useRef();

  const features = [
    {
      title: "Smart Validation",
      icon: "🔍",
      description:
        "Automatically validate file formats, content type, and document structure for accurate classification.",
      items: ["Format validation", "Content analysis", "Structure detection"],
    },
    {
      title: "Metadata Extraction",
      icon: "⚡",
      description:
        "Extract relevant metadata from document properties and embedded information for enhanced processing.",
      items: ["File properties", "Embedded metadata", "Content insights"],
    },
    {
      title: "Quality Assessment",
      icon: "✅",
      description:
        "Analyze document quality and readiness for processing with confidence scoring for optimal results.",
      items: ["Quality scoring", "Readiness check", "Optimization tips"],
    },
    {
      title: "AI Preprocessing",
      icon: "🤖",
      description:
        "Intelligent preprocessing with AI-powered document enhancement and optimization.",
      items: ["Image enhancement", "Text correction", "Format optimization"],
    },
  ];

  const fetchDocuments = async () => {
    try {
      const response = await listDocuments();
      // Handle the response structure from backend
      if (response.success && Array.isArray(response.documents)) {
        setDocuments(response.documents);
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setDocuments(response);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFilesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      console.log("Uploading files:", files.map(f => f.name));
      setSelectedFiles(files);
      setError(null);
      setSuccess(null);
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Files exceeding 20MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setIsIngesting(true);
      setUploadProgress({});
      
      try {
        if (files.length === 1) {
          // Single file upload
          await uploadDocument(files[0]);
          setSuccess(`✅ "${files[0].name}" uploaded and ready for processing!`);
        } else {
          // Multiple files upload
          const result = await uploadMultipleDocuments(files);
          setSuccess(result.userMessage);
          setUploadProgress({
            total: result.summary.totalFiles,
            successful: result.summary.successful,
            failed: result.summary.failed,
            errors: result.errors
          });
        }
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleFoldersUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      console.log("Uploading folder files:", files.map(f => f.name));
      setSelectedFolders(files);
      setError(null);
      setSuccess(null);
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Files exceeding 20MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setIsIngesting(true);
      setUploadProgress({});
      
      try {
        // Multiple files upload for folders
        const result = await uploadMultipleDocuments(files);
        setSuccess(result.userMessage);
        setUploadProgress({
          total: result.summary.totalFiles,
          successful: result.summary.successful,
          failed: result.summary.failed,
          errors: result.errors
        });
        setSelectedFolders([]);
        if (folderInputRef.current) folderInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleFilesDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    setError(null);
    setSuccess(null);
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0) {
      console.log("Dropped files:", files.map(f => f.name));
      setSelectedFiles(files);
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Files exceeding 20MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setIsIngesting(true);
      setUploadProgress({});
      
      try {
        if (files.length === 1) {
          // Single file upload
          await uploadDocument(files[0]);
          setSuccess(`✅ "${files[0].name}" uploaded and ready for processing!`);
        } else {
          // Multiple files upload
          const result = await uploadMultipleDocuments(files);
          setSuccess(result.userMessage);
          setUploadProgress({
            total: result.summary.totalFiles,
            successful: result.summary.successful,
            failed: result.summary.failed,
            errors: result.errors
          });
        }
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleFoldersDrop = async (event) => {
    event.preventDefault();
    setFolderDragActive(false);
    setError(null);
    setSuccess(null);
    
    // For folders, we need to handle the items differently
    const items = Array.from(event.dataTransfer.items);
    const files = [];
    
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          // Handle directory
          await readDirectory(entry, files);
        } else if (entry && entry.isFile) {
          // Handle single file
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      console.log("Dropped folder files:", files.map(f => f.name));
      setSelectedFolders(files);
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Files exceeding 20MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setIsIngesting(true);
      setUploadProgress({});
      
      try {
        // Multiple files upload for folders
        const result = await uploadMultipleDocuments(files);
        setSuccess(result.userMessage);
        setUploadProgress({
          total: result.summary.totalFiles,
          successful: result.summary.successful,
          failed: result.summary.failed,
          errors: result.errors
        });
        setSelectedFolders([]);
        if (folderInputRef.current) folderInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const readDirectory = async (dirEntry, files) => {
    const reader = dirEntry.createReader();
    const entries = await new Promise((resolve) => {
      reader.readEntries(resolve);
    });
    
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise((resolve) => {
          entry.file(resolve);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        await readDirectory(entry, files);
      }
    }
  };

  const handleFilesDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleFilesDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFoldersDragOver = (e) => {
    e.preventDefault();
    setFolderDragActive(true);
  };

  const handleFoldersDragLeave = (e) => {
    e.preventDefault();
    setFolderDragActive(false);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: "12px" }}>⬆️</span>
          AI-Powered Document Ingestion
        </h1>
        <p className="dashboard-subtitle">
          Upload and ingest documents with intelligent metadata extraction and
          validation. Our AI analyzes file structure, content type, and quality
          to prepare documents for processing.
        </p>
      </div>
      <div style={{ margin: "16px 0", color: "#2563eb", fontWeight: 500 }}>
        {documents.length > 0
          ? documents[0].messages?.ingest || "Ready for ingestion!"
          : "No documents ingested yet."}
      </div>

      <div className="upload-section">
        <div className="section-title" style={{ color: 'var(--text-primary)' }}>
          <span style={{ marginRight: "8px" }}>🤖</span>
          AI Document Ingestion
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Upload files or folders for AI-powered ingestion with smart validation and
          preprocessing
        </p>

        {/* Tab Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setActiveTab('files')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'files' ? '#2563eb' : 'transparent',
              color: activeTab === 'files' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
              borderBottom: activeTab === 'files' ? '3px solid #2563eb' : '3px solid transparent'
            }}
          >
            📁 Files
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'folders' ? '#2563eb' : 'transparent',
              color: activeTab === 'folders' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
              borderBottom: activeTab === 'folders' ? '3px solid #2563eb' : '3px solid transparent'
            }}
          >
            📂 Folders
          </button>
        </div>

        {/* Files Upload Area */}
        {activeTab === 'files' && (
          <div
            className="upload-area"
            onDrop={handleFilesDrop}
            onDragOver={handleFilesDragOver}
            onDragLeave={handleFilesDragLeave}
            style={{
              border: dragActive ? "2px solid #1e40af" : "2px dashed #2563eb",
              background: dragActive ? "#e0e7ff" : "#f8fafc",
              borderRadius: 8,
              padding: 24,
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            <div className="upload-icon">📁</div>
            <div className="upload-title" style={{ color: '#000' }}>Upload Individual Files</div>
            <div className="upload-description" style={{ color: '#000' }}>
              Select single or multiple files, or drag & drop files here. Supports PDF, DOC, DOCX, TXT, image, MSG, and EML files
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesUpload}
              accept={SUPPORTED_EXTENSIONS.join(",")}
              multiple
              style={{ display: "none" }}
              id="files-upload"
            />
            <label htmlFor="files-upload" className="upload-button">
              {isIngesting ? "Uploading..." : "Select Files"}
            </label>
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                  Selected Files ({selectedFiles.length}):
                </div>
                <div style={{ maxHeight: "100px", overflowY: "auto", fontSize: "0.875rem" }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Folders Upload Area */}
        {activeTab === 'folders' && (
          <div
            className="upload-area"
            onDrop={handleFoldersDrop}
            onDragOver={handleFoldersDragOver}
            onDragLeave={handleFoldersDragLeave}
            style={{
              border: folderDragActive ? "2px solid #1e40af" : "2px dashed #2563eb",
              background: folderDragActive ? "#e0e7ff" : "#f8fafc",
              borderRadius: 8,
              padding: 24,
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            <div className="upload-icon">📂</div>
            <div className="upload-title" style={{ color: '#000' }}>Upload Folder</div>
            <div className="upload-description" style={{ color: '#000' }}>
              Select a folder or drag & drop a folder here. All supported files in the folder will be processed
            </div>
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFoldersUpload}
              accept={SUPPORTED_EXTENSIONS.join(",")}
              multiple
              webkitdirectory=""
              style={{ display: "none" }}
              id="folders-upload"
            />
            <label htmlFor="folders-upload" className="upload-button">
              {isIngesting ? "Uploading..." : "Select Folder"}
            </label>
            {selectedFolders.length > 0 && (
              <div style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                  Selected Folder Files ({selectedFolders.length}):
                </div>
                <div style={{ maxHeight: "100px", overflowY: "auto", fontSize: "0.875rem" }}>
                  {selectedFolders.map((file, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress and Messages */}
        {uploadProgress.total && (
          <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Upload Summary:</div>
            <div>✅ Successful: {uploadProgress.successful}</div>
            {uploadProgress.failed > 0 && <div style={{ color: "red" }}>❌ Failed: {uploadProgress.failed}</div>}
            {uploadProgress.errors && uploadProgress.errors.length > 0 && (
              <div style={{ marginTop: "8px", fontSize: "0.875rem" }}>
                <div style={{ fontWeight: "600" }}>Errors:</div>
                {uploadProgress.errors.map((err, index) => (
                  <div key={index} style={{ color: "red", marginLeft: "8px" }}>
                    {err.fileName}: {err.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {success && (
          <div style={{ color: "green", marginTop: 8 }}>{success}</div>
        )}
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        <div
          style={{
            marginTop: "16px",
            fontSize: "0.875rem",
            color: "var(--text-primary)",
          }}
        >
          Maximum file size: 20MB | Supported: PDF, DOC, DOCX, TXT, JPG, PNG,
          GIF, MSG, EML
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "8px" }}>🔧</span>
          AI Ingestion Features
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Advanced AI algorithms to intelligently process document ingestion
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div
                  className="feature-icon"
                  style={{
                    background:
                      index === 0
                        ? "var(--accent-primary)"
                        : index === 1
                        ? "var(--accent-secondary)"
                        : index === 2
                        ? "var(--accent-tertiary)"
                        : "#3730a3",
                    color: "white",
                  }}
                >
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
              </div>
              <div className="feature-description">{feature.description}</div>
              <ul className="feature-list">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Document Management</h2>
          <span
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            Manage and monitor ingested documents with AI insights
          </span>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No documents uploaded yet</div>
            <div className="empty-description">
              Upload your first documents to get started with AI processing
            </div>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: 16,
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Type</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} data-tip data-for={`ingest-doc-details-${doc.id}`}>
                  <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>{doc.name}</td>
                  <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>{doc.status}</td>
                  <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>{doc.type || "-"}</td>
                  <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>{doc.destination || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
