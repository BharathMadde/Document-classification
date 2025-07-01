import React, { useState, useEffect } from "react";
import {
  uploadDocument,
  extractDocument,
  classifyDocument,
  listDocuments,
  getDocument,
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
];
function getFileExtension(filename) {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1)
    .toLowerCase();
}

export default function Classify() {
  const [selectedId, setSelectedId] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoClassifiedId, setAutoClassifiedId] = useState(null);

  const features = [
    {
      title: "Multi-Modal AI",
      icon: "🧠",
      description:
        "Combine multiple AI models for accurate document classification.",
      color: "#1e3a8a",
    },
    {
      title: "Confidence Scoring",
      icon: "📊",
      description:
        "Receive confidence percentages for classification accuracy.",
      color: "#1d4ed8",
    },
    {
      title: "Real-time Processing",
      icon: "⚡",
      description:
        "Fast, scalable and responsive results for high-volume workflows.",
      color: "#2563eb",
    },
    {
      title: "Custom Categories",
      icon: "🏷️",
      description:
        "Support custom document types and industry-specific categories.",
      color: "#3730a3",
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

  // Auto-classify the most recent 'Extracted' document
  useEffect(() => {
    const extractedDoc = documents.find((doc) => doc.status === "Extracted");
    if (extractedDoc && extractedDoc.id !== autoClassifiedId) {
      setAutoClassifiedId(extractedDoc.id);
      handleAutoClassify(extractedDoc.id);
    }
    // eslint-disable-next-line
  }, [documents]);

  const handleAutoClassify = async (id) => {
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(id);
      const res = await classifyDocument(
        id,
        doc.entities ? doc.entities.text || "" : ""
      );
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

  const handleClassify = async () => {
    if (!selectedId) return;
    setIsClassifying(true);
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(selectedId);
      const res = await classifyDocument(
        selectedId,
        doc.entities ? doc.entities.text || "" : ""
      );
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleClassifyUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsClassifying(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        const classifyRes = await classifyDocument(
          id,
          extractRes.extractedText
        );
        setResult(classifyRes);
        setSelectedId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  // Calculate analytics from documents
  const calculateAnalytics = () => {
    const classifiedDocs = documents.filter(doc => doc.type && doc.status === "Classified");
    
    if (classifiedDocs.length === 0) return null;

    // Document type breakdown
    const typeCounts = {};
    let totalConfidence = 0;
    let highConfidenceCount = 0;
    let mediumConfidenceCount = 0;
    let lowConfidenceCount = 0;

    classifiedDocs.forEach(doc => {
      const type = doc.type;
      const confidence = doc.confidence || 0;
      
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      totalConfidence += confidence;
      
      if (confidence >= 80) highConfidenceCount++;
      else if (confidence >= 60) mediumConfidenceCount++;
      else lowConfidenceCount++;
    });

    const documentTypes = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / classifiedDocs.length) * 100)
    }));

    const averageConfidence = Math.round(totalConfidence / classifiedDocs.length);
    const classificationRate = Math.round((classifiedDocs.length / documents.length) * 100);

    return {
      totalDocuments: documents.length,
      classifiedDocuments: classifiedDocs.length,
      classificationRate,
      averageConfidence,
      documentTypes,
      confidenceBreakdown: {
        high: highConfidenceCount,
        medium: mediumConfidenceCount,
        low: lowConfidenceCount
      }
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title section-darkblue-light">
          <span style={{ marginRight: "12px" }}>🧠</span>
          AI Document Classification
        </h1>
        <p className="dashboard-subtitle">
          Automatically classify documents using advanced machine learning
          models. Our AI analyzes content, structure, and context to determine
          document types with high confidence scores.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "12px" }}>🤖</span>
          AI Classification Upload
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Upload a document or select an existing one to classify
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
              onChange={handleClassifyUpload}
              accept={SUPPORTED_EXTENSIONS.join(",")}
              style={{ 
                display: "block", 
                width: "100%", 
                padding: "8px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px"
              }}
              id="classify-upload"
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
              onClick={handleClassify}
              disabled={!selectedId || isClassifying}
              style={{ 
                padding: "8px 16px",
                backgroundColor: "var(--accent-primary)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !selectedId || isClassifying ? "not-allowed" : "pointer",
                opacity: !selectedId || isClassifying ? 0.6 : 1
              }}
            >
              {isClassifying ? "Classifying..." : "Classify"}
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
        
        <div style={{ margin: "16px 0", color: "#1d4ed8", fontWeight: 500 }}>
          {selectedId
            ? documents.find((d) => d.id === selectedId)?.messages?.classify ||
              "Classification status unavailable."
            : "Select or upload a document to classify."}
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "8px" }}>🔧</span>
          AI Classification Features
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          State-of-the-art machine learning for document classification
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div
                  className="feature-icon"
                  style={{
                    backgroundColor: feature.color,
                    color: "white",
                  }}
                >
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
              </div>
              <div className="feature-description">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Classification Results</h2>
          <span
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            Documents classified with AI confidence scores
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
              }}>🏷️</div>
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
                  Classified on {new Date().toLocaleDateString()}
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
                📋 Document Type
              </h3>
              <div style={{ 
                background: "var(--bg-tertiary)", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ 
                    fontWeight: "500", 
                    color: "var(--text-primary)",
                    fontSize: "18px"
                  }}>
                    {result.type || "Unknown"}
                  </span>
                  <span style={{ 
                    padding: "4px 12px",
                    background: "#10b981",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}>
                    {result.status || "Classified"}
                  </span>
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
                📊 Confidence Score
              </h3>
              <div style={{ 
                background: "var(--bg-tertiary)", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{ 
                    flex: 1,
                    background: "var(--bg-primary)",
                    height: "8px",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div style={{ 
                      width: `${result.confidence || 0}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #10b981, #059669)",
                      transition: "width 0.3s ease"
                    }}></div>
                  </div>
                  <span style={{ 
                    fontWeight: "600", 
                    color: "var(--text-primary)",
                    minWidth: "60px",
                    textAlign: "right"
                  }}>
                    {result.confidence || 0}%
                  </span>
                </div>
                <div style={{ 
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "var(--text-secondary)"
                }}>
                  {result.confidence >= 90 ? "Very High Confidence" :
                   result.confidence >= 70 ? "High Confidence" :
                   result.confidence >= 50 ? "Medium Confidence" :
                   "Low (&lt;60%)"}
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ 
                marginBottom: "12px", 
                color: "var(--text-primary)",
                fontSize: "16px",
                fontWeight: "600"
              }}>
                🔍 Classification Details
              </h3>
              <div style={{ 
                background: "var(--bg-tertiary)", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "8px",
                    background: "var(--bg-primary)",
                    borderRadius: "4px"
                  }}>
                    <span style={{ 
                      fontWeight: "500", 
                      color: "var(--text-primary)"
                    }}>
                      Document Type:
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {result.type || "Unknown"}
                    </span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "8px",
                    background: "var(--bg-primary)",
                    borderRadius: "4px"
                  }}>
                    <span style={{ 
                      fontWeight: "500", 
                      color: "var(--text-primary)"
                    }}>
                      Confidence:
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {result.confidence || 0}%
                    </span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "8px",
                    background: "var(--bg-primary)",
                    borderRadius: "4px"
                  }}>
                    <span style={{ 
                      fontWeight: "500", 
                      color: "var(--text-primary)"
                    }}>
                      Status:
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {result.status || "Classified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <div className="empty-title">No classification results yet</div>
            <div className="empty-description">
              Upload documents or select existing ones to see AI classification results
            </div>
          </div>
        )}
      </div>

      {/* Add gap between Classification Results and Document Type Distribution */}
      <div style={{ height: '32px' }}></div>

      <div className="pipeline-section">
        <div className="section-title">Document Types Distribution</div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Breakdown of classified document types and accuracy metrics
        </p>
        
        {analytics ? (
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Overall Metrics */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "16px" 
            }}>
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)" }}>
                  {analytics.totalDocuments}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Total Documents
                </div>
              </div>
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#10b981" }}>
                  {analytics.classifiedDocuments}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Classified
                </div>
              </div>
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#f59e0b" }}>
                  {analytics.averageConfidence}%
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Avg Confidence
                </div>
              </div>
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#3b82f6" }}>
                  {analytics.classificationRate}%
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Classification Rate
                </div>
              </div>
            </div>

            {/* Document Type Breakdown */}
            <div>
              <h3 style={{ 
                marginBottom: "16px", 
                color: "var(--text-primary)",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                📊 Document Type Distribution
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {analytics.documentTypes.map((typeData, index) => (
                  <div key={index} style={{ 
                    background: "var(--bg-secondary)", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px"
                    }}>
                      <span style={{ 
                        fontWeight: "500", 
                        color: "var(--text-primary)",
                        fontSize: "16px"
                      }}>
                        {typeData.type}
                      </span>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "var(--text-primary)",
                        fontSize: "16px"
                      }}>
                        {typeData.count} ({typeData.percentage}%)
                      </span>
                    </div>
                    <div style={{ 
                      background: "var(--bg-primary)", 
                      height: "8px", 
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{ 
                        width: `${typeData.percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Breakdown */}
            <div>
              <h3 style={{ 
                marginBottom: "16px", 
                color: "var(--text-primary)",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                🎯 Confidence Distribution
              </h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                gap: "16px" 
              }}>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "600", 
                    color: "#10b981",
                    marginBottom: "4px"
                  }}>
                    {analytics.confidenceBreakdown.high}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    High (≥80%)
                  </div>
                </div>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "600", 
                    color: "#f59e0b",
                    marginBottom: "4px"
                  }}>
                    {analytics.confidenceBreakdown.medium}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Medium (60-79%)
                  </div>
                </div>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "600", 
                    color: "#ef4444",
                    marginBottom: "4px"
                  }}>
                    {analytics.confidenceBreakdown.low}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Low (&lt;60%)
                  </div>
                </div>
              </div>
            </div>

            {/* Accuracy Metrics */}
            <div>
              <h3 style={{ 
                marginBottom: "16px", 
                color: "var(--text-primary)",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                📈 Performance Metrics
              </h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "16px" 
              }}>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)"
                }}>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    color: "#10b981",
                    marginBottom: "4px"
                  }}>
                    {analytics.classificationRate}%
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Classification Success Rate
                  </div>
                </div>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)"
                }}>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    color: "#3b82f6",
                    marginBottom: "4px"
                  }}>
                    {analytics.averageConfidence}%
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Average Confidence Score
                  </div>
                </div>
                <div style={{ 
                  background: "var(--bg-secondary)", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)"
                }}>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    color: "#8b5cf6",
                    marginBottom: "4px"
                  }}>
                    {analytics.documentTypes.length}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Unique Document Types
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No classification data available</div>
            <div className="empty-description">
              Process documents to see AI classification analytics and metrics
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
