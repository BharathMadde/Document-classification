import React, { useState, useEffect } from "react";
import {
  uploadDocument,
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef();

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

  const handleIngestUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Uploading file:", file.name, "Type:", file.type, "Size:", file.size);
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      if (file.size > 20 * 1024 * 1024) {
        setError("File size must be less than 20MB.");
        return;
      }
      setIsIngesting(true);
      try {
        await uploadDocument(file);
        setSuccess(`✅ "${file.name}" uploaded and ready for processing!`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    setError(null);
    setSuccess(null);
    const file = event.dataTransfer.files[0];
    if (file) {
      console.log("Dropped file:", file.name, "Type:", file.type, "Size:", file.size);
      setSelectedFile(file);
      if (file.size > 20 * 1024 * 1024) {
        setError("File size must be less than 20MB.");
        return;
      }
      setIsIngesting(true);
      try {
        await uploadDocument(file);
        setSuccess(`✅ "${file.name}" uploaded and ready for processing!`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
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
        <div className="section-title">
          <span style={{ marginRight: "8px" }}>🤖</span>
          AI Document Ingestion
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Upload files for AI-powered ingestion with smart validation and
          preprocessing
        </p>

        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: dragActive ? "2px solid #1e40af" : "2px dashed #2563eb",
            background: dragActive ? "#e0e7ff" : "#f8fafc",
            borderRadius: 8,
            padding: 24,
            textAlign: "center",
            transition: "all 0.2s",
          }}
        >
          <div className="upload-icon">⬆️</div>
          <div className="upload-title">Upload for AI Ingestion</div>
          <div className="upload-description">
            Supports PDF, DOC, DOCX, TXT, image, MSG, and EML files with
            AI-powered preprocessing
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleIngestUpload}
            accept={SUPPORTED_EXTENSIONS.join(",")}
            style={{ display: "none" }}
            id="ingest-upload"
          />
          <label htmlFor="ingest-upload" className="upload-button">
            {isIngesting ? "Uploading..." : "Upload for Ingestion"}
          </label>
          {selectedFile && (
            <div style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Selected: {selectedFile.name}
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
              color: "var(--text-tertiary)",
            }}
          >
            Maximum file size: 20MB | Supported: PDF, DOC, DOCX, TXT, JPG, PNG,
            GIF, MSG, EML
          </div>
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
                <th>Confidence</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 8 }}>{doc.name}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 8 }}>{doc.status}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 8 }}>{doc.type || "-"}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 8 }}>{doc.confidence || "-"}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 8 }}>{doc.destination || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
