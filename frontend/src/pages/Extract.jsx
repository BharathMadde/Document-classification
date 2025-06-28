import React, { useState, useEffect } from "react";
import { uploadDocument, extractDocument, listDocuments } from "../api";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
];
function getFileExtension(filename) {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1)
    .toLowerCase();
}

export default function Extract() {
  const [selectedId, setSelectedId] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoExtractedId, setAutoExtractedId] = useState(null);

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

  // Auto-extract the most recent 'Ingested' document
  useEffect(() => {
    const ingestedDoc = documents.find((doc) => doc.status === "Ingested");
    if (ingestedDoc && ingestedDoc.id !== autoExtractedId) {
      setAutoExtractedId(ingestedDoc.id);
      handleAutoExtract(ingestedDoc.id);
    }
    // eslint-disable-next-line
  }, [documents]);

  const handleAutoExtract = async (id) => {
    setError(null);
    setResult(null);
    try {
      const res = await extractDocument(id);
      setResult(res);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      // Simulate status update to 'Human Intervention' in frontend
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: "Human Intervention" } : doc
        )
      );
    }
  };

  const handleExtract = async () => {
    if (!selectedId) return;
    setIsExtracting(true);
    setError(null);
    setResult(null);
    try {
      const res = await extractDocument(selectedId);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsExtracting(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        setResult(extractRes);
        setSelectedId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const capabilities = [
    {
      title: "OCR Text Extraction",
      icon: "👁️",
      description:
        "Advanced optical character recognition for scanned documents and images.",
      color: "#1e3a8a",
    },
    {
      title: "Table Recognition",
      icon: "📋",
      description:
        "Intelligent extraction of tabular data with structure preservation.",
      color: "#1d4ed8",
    },
    {
      title: "Entity Extraction",
      icon: "🔍",
      description:
        "Identify and extract key entities like names, dates, and amounts.",
      color: "#2563eb",
    },
    {
      title: "Form Processing",
      icon: "📝",
      description:
        "Automatic extraction of data from structured forms and documents.",
      color: "#3730a3",
    },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: "12px" }}>🔍</span>
          AI Document Extraction
        </h1>
        <p className="dashboard-subtitle">
          Extract text, tables, and structured data from documents using
          advanced AI. Our machine learning models can process various document
          types and formats with high accuracy and speed.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "12px" }}>🤖</span>
          AI Extraction Upload
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Upload a document or select an existing one to extract text/entities
        </p>
        
        <div style={{ 
          background: "var(--bg-secondary)", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "var(--text-primary)"
            }}>
              Upload New Document:
            </label>
            <input
              type="file"
              onChange={handleExtractUpload}
              accept={SUPPORTED_EXTENSIONS.join(",")}
              style={{ 
                display: "block", 
                width: "100%", 
                padding: "8px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px"
              }}
              id="extract-upload"
            />
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "var(--text-primary)"
            }}>
              Or Select Existing Document:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                marginBottom: "8px"
              }}
            >
              <option value="">Select Existing Document</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleExtract}
              disabled={!selectedId || isExtracting}
              style={{ 
                padding: "8px 16px",
                backgroundColor: "var(--accent-primary)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !selectedId || isExtracting ? "not-allowed" : "pointer",
                opacity: !selectedId || isExtracting ? 0.6 : 1
              }}
            >
              {isExtracting ? "Extracting..." : "Extract"}
            </button>
          </div>
          
          {selectedFile && (
            <div style={{ 
              marginTop: "8px", 
              color: "var(--text-secondary)",
              padding: "8px",
              background: "var(--bg-tertiary)",
              borderRadius: "4px"
            }}>
              📄 Uploaded: {selectedFile.name}
            </div>
          )}
          {error && (
            <div style={{ 
              color: "red", 
              marginTop: 8,
              padding: "8px",
              background: "#fef2f2",
              borderRadius: "4px",
              border: "1px solid #fecaca"
            }}>
              ❌ {error}
            </div>
          )}
        </div>
        
        <div style={{ margin: "16px 0", color: "#1e3a8a", fontWeight: 500 }}>
          {selectedId
            ? documents.find((d) => d.id === selectedId)?.messages?.extract ||
              "Extraction status unavailable."
            : "Select or upload a document to extract."}
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "8px" }}>🔧</span>
          AI Extraction Capabilities
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Advanced AI algorithms to intelligently extract various content types
        </p>

        <div className="features-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div
                  className="feature-icon"
                  style={{
                    backgroundColor: capability.color,
                    color: "white",
                  }}
                >
                  {capability.icon}
                </div>
                <div className="feature-title">{capability.title}</div>
              </div>
              <div className="feature-description">
                {capability.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Extraction Results</h2>
          <span
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            View and download extracted data from processed documents
          </span>
        </div>
        
        {result ? (
          <div style={{ 
            background: "var(--bg-secondary)", 
            padding: "20px", 
            borderRadius: "8px",
            marginTop: "16px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-color)"
            }}>
              <div style={{ 
                fontSize: "24px", 
                marginRight: "12px" 
              }}>📄</div>
              <div>
                <div style={{ 
                  fontWeight: "600", 
                  fontSize: "16px",
                  color: "var(--text-primary)"
                }}>
                  {selectedFile ? selectedFile.name : documents.find(d => d.id === selectedId)?.name}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "var(--text-secondary)" 
                }}>
                  Extracted on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ 
                marginBottom: "12px", 
                color: "var(--text-primary)",
                fontSize: "16px",
                fontWeight: "600"
              }}>
                📝 Extracted Text
              </h3>
              <div style={{ 
                background: "var(--bg-tertiary)", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                maxHeight: "300px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
                {result.extractedText || "No text extracted"}
              </div>
            </div>
            
            <div>
              <h3 style={{ 
                marginBottom: "12px", 
                color: "var(--text-primary)",
                fontSize: "16px",
                fontWeight: "600"
              }}>
                🔍 Extracted Entities
              </h3>
              <div style={{ 
                background: "var(--bg-tertiary)", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {result.entities && Object.keys(result.entities).length > 0 ? (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {Object.entries(result.entities).map(([key, value]) => (
                      <div key={key} style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        padding: "8px",
                        background: "var(--bg-primary)",
                        borderRadius: "4px"
                      }}>
                        <span style={{ 
                          fontWeight: "500", 
                          color: "var(--text-primary)",
                          textTransform: "capitalize"
                        }}>
                          {key}:
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {Array.isArray(value) ? value.join(", ") : value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    color: "var(--text-secondary)", 
                    fontStyle: "italic" 
                  }}>
                    No entities extracted
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No extraction results yet</div>
            <div className="empty-description">
              Upload documents or select existing ones to see AI extraction results
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
