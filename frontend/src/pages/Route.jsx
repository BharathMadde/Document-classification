import React, { useState, useEffect } from "react";
import {
  uploadDocument,
  extractDocument,
  classifyDocument,
  routeDocument,
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
  ".msg",
  ".eml",
];

function getFileExtension(filename) {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1)
    .toLowerCase();
}

// Document Preview Modal Component
const DocumentPreview = ({ document, onClose }) => {
  if (!document) return null;

  const getFileIcon = (filename) => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case '.pdf': return '📄';
      case '.doc':
      case '.docx': return '📝';
      case '.txt': return '📄';
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif': return '🖼️';
      case '.msg':
      case '.eml': return '📧';
      default: return '📄';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>{getFileIcon(document.name)}</span>
            <div>
              <h2 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {document.name}
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                {document.type || 'Unknown Type'} • {document.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📋 Document Details
          </h3>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '4px'
              }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  Document Type:
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {document.type || 'Unknown'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '4px'
              }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  Status:
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {document.status}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '4px'
              }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  Destination:
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {document.destination || 'Not routed'}
                </span>
              </div>
              {document.confidence && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    Confidence:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {(document.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {document.timestamps?.ingested && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    Uploaded:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(document.timestamps.ingested).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {document.entities && Object.keys(document.entities).length > 0 && (
          <div>
            <h3 style={{
              margin: '0 0 12px 0',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              🔍 Extracted Data
            </h3>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(document.entities).map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px'
                  }}>
                    <span style={{
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      textTransform: 'capitalize'
                    }}>
                      {key}:
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Route() {
  const [selectedId, setSelectedId] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoRoutedId, setAutoRoutedId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Define all possible routing destinations
  const routingDestinations = [
    {
      id: "accounting-erp",
      name: "Accounting ERP",
      icon: "💰",
      description: "Financial documents, invoices, and payment processing",
      color: "#1e3a8a",
      documents: [],
    },
    {
      id: "legal-dms",
      name: "Legal DMS",
      icon: "⚖️",
      description: "Contracts, legal documents, and compliance materials",
      color: "#1d4ed8",
      documents: [],
    },
    {
      id: "analytics-dashboard",
      name: "Analytics Dashboard",
      icon: "📊",
      description: "Reports, analytics, and business intelligence data",
      color: "#2563eb",
      documents: [],
    },
    {
      id: "expense-tracker",
      name: "Expense Tracker",
      icon: "🧾",
      description: "Receipts, expense reports, and reimbursement documents",
      color: "#3730a3",
      documents: [],
    },
    {
      id: "financial-review",
      name: "Financial Review",
      icon: "📈",
      description: "Financial statements, budgets, and financial analysis",
      color: "#7c3aed",
      documents: [],
    },
    {
      id: "slack",
      name: "Slack",
      icon: "💬",
      description: "Documents sent to Slack for team review and collaboration",
      color: "#4f46e5",
      documents: [],
    },
    {
      id: "unclassified-unrouted",
      name: "Unclassified/Unrouted",
      icon: "❓",
      description: "Documents that need processing or manual routing",
      color: "#f59e0b",
      documents: [],
    },
    {
      id: "manual-review",
      name: "Manual Review",
      icon: "👀",
      description: "Documents requiring human intervention and review",
      color: "#dc2626",
      documents: [],
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

  // Auto-route the most recent 'Classified' document
  useEffect(() => {
    const classifiedDoc = documents.find((doc) => doc.status === "Classified");
    if (classifiedDoc && classifiedDoc.id !== autoRoutedId) {
      setAutoRoutedId(classifiedDoc.id);
      handleAutoRoute(classifiedDoc.id);
    }
    // eslint-disable-next-line
  }, [documents]);

  const handleAutoRoute = async (id) => {
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(id);
      const res = await routeDocument(id, doc.type);
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

  const handleRoute = async () => {
    if (!selectedId) return;
    setIsRouting(true);
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(selectedId);
      const res = await routeDocument(selectedId, doc.type);
      setResult(res);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRouting(false);
    }
  };

  const handleRouteUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsRouting(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        const classifyRes = await classifyDocument(
          id,
          extractRes.extractedText
        );
        const routeRes = await routeDocument(id, classifyRes.type);
        setResult(routeRes);
        setSelectedId(id);
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsRouting(false);
      }
    }
  };

  const handleRouteCardClick = (route) => {
    setSelectedRoute(route);
  };

  const handleBackToRoutes = () => {
    setSelectedRoute(null);
  };

  const handleDocumentClick = (document) => {
    setPreviewDocument(document);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
  };

  // Group documents by destination
  const getDocumentsByDestination = () => {
    const grouped = {};
    routingDestinations.forEach((dest) => {
      if (dest.name === "Unclassified/Unrouted") {
        // Documents that haven't been processed or routed yet
        grouped[dest.name] = documents.filter(
          (doc) =>
            !doc.destination ||
            doc.status === "Ingested" ||
            doc.status === "Extracted" ||
            (doc.status === "Classified" && !doc.destination)
        );
      } else if (dest.name === "Manual Review") {
        // Documents specifically marked for manual review
        grouped[dest.name] = documents.filter(
          (doc) =>
            doc.destination === "Manual Review" ||
            doc.status === "Human Intervention"
        );
      } else {
        // Regular destination grouping
        grouped[dest.name] = documents.filter(
          (doc) => doc.destination === dest.name
        );
      }
    });
    return grouped;
  };

  const documentsByDestination = getDocumentsByDestination();

  // If a specific route is selected, show its documents
  if (selectedRoute) {
    const routeDocuments = documentsByDestination[selectedRoute.name] || [];

    return (
      <div className="page-container">
        <div className="dashboard-header">
          <button
            onClick={handleBackToRoutes}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-primary)",
              cursor: "pointer",
              fontSize: "1rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Back to Routes
          </button>
          <h1 className="dashboard-title">
            <span style={{ marginRight: "12px" }}>{selectedRoute.icon}</span>
            {selectedRoute.name}
          </h1>
          <p className="dashboard-subtitle">{selectedRoute.description}</p>
        </div>

        <div className="recent-documents">
          <div className="recent-header">
            <h2 className="section-title">
              Documents in {selectedRoute.name}
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                }}
              >
                ({routeDocuments.length} documents)
              </span>
            </h2>
          </div>

          {routeDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{selectedRoute.icon}</div>
              <div className="empty-title">
                No documents in {selectedRoute.name}
              </div>
              <div className="empty-description">
                Documents will appear here once they are routed to this
                destination
              </div>
            </div>
          ) : (
            <div style={{ 
              background: "var(--bg-secondary)", 
              padding: "20px", 
              borderRadius: "8px",
              marginTop: "16px"
            }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ 
                      textAlign: "left", 
                      padding: "12px 8px",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      Document Name
                    </th>
                    <th style={{ 
                      textAlign: "left", 
                      padding: "12px 8px",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      textAlign: "left", 
                      padding: "12px 8px",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      Type
                    </th>
                    <th style={{ 
                      textAlign: "left", 
                      padding: "12px 8px",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      Confidence
                    </th>
                    <th style={{ 
                      textAlign: "left", 
                      padding: "12px 8px",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      Uploaded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {routeDocuments.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <button
                          onClick={() => handleDocumentClick(doc)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent-primary)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {doc.name}
                        </button>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            background:
                              doc.status === "Routed"
                                ? "var(--success)"
                                : "var(--processing)",
                            color: "white",
                          }}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.type || "-"}
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.confidence
                          ? `${(doc.confidence * 100).toFixed(1)}%`
                          : "-"}
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.timestamps?.ingested
                          ? new Date(doc.timestamps.ingested).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {previewDocument && (
          <DocumentPreview 
            document={previewDocument} 
            onClose={handleClosePreview} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title section-darkblue-light">
          <span style={{ marginRight: "12px" }}>🚀</span>
          Intelligent Document Routing
        </h1>
        <p className="dashboard-subtitle">
          Automatically route documents to appropriate systems and departments
          based on their classification. Our AI determines the optimal
          destination for each document type with smart workflow integration.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "12px" }}>🤖</span>
          AI Routing Upload
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Upload a document or select an existing one to route
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
              onChange={handleRouteUpload}
              accept={SUPPORTED_EXTENSIONS.join(",")}
              style={{ 
                display: "block", 
                width: "100%", 
                padding: "8px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px"
              }}
              id="route-upload"
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
              {documents
                .filter((doc) => doc.status === "Classified")
                .map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
            </select>
            <button
              onClick={handleRoute}
              disabled={!selectedId || isRouting}
              style={{ 
                padding: "8px 16px",
                backgroundColor: "var(--accent-primary)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !selectedId || isRouting ? "not-allowed" : "pointer",
                opacity: !selectedId || isRouting ? 0.6 : 1
              }}
            >
              {isRouting ? "Routing..." : "Route"}
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
          {result && (
            <div style={{ 
              marginTop: 16,
              color: "green",
              padding: "12px",
              background: "rgba(0, 223, 162, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(0, 223, 162, 0.2)"
            }}>
              <div>
                <strong>✅ {result.userMessage}</strong>
              </div>
              <div style={{ marginTop: "4px", fontSize: "0.875rem" }}>
                Destination: {result.destination} | Status: {result.status}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: "8px" }}>🎯</span>
          Routing Destinations
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Click on a destination to view documents routed there
        </p>

        <div className="features-grid">
          {routingDestinations.map((route, index) => {
            const routeDocuments = documentsByDestination[route.name] || [];
            return (
              <div
                key={route.id}
                className="feature-card"
                onClick={() => handleRouteCardClick(route)}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-header">
                  <div
                    className="feature-icon"
                    style={{
                      backgroundColor: route.color,
                      color: "white",
                    }}
                  >
                    {route.icon}
                  </div>
                  <div className="feature-title">
                    {route.name}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.75rem",
                        background: "var(--accent-primary)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "8px",
                      }}
                    >
                      {routeDocuments.length}
                    </span>
                  </div>
                </div>
                <div className="feature-description">{route.description}</div>
                {routeDocuments.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Latest: {routeDocuments[0]?.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Routing Activity</h2>
          <span
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            Track recent document routing decisions
          </span>
        </div>

        {documents.filter((doc) => doc.status === "Routed").length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <div className="empty-title">No routing activity yet</div>
            <div className="empty-description">
              Upload and process documents to see routing results
            </div>
          </div>
        ) : (
          <div style={{ 
            background: "var(--bg-secondary)", 
            padding: "20px", 
            borderRadius: "8px",
            marginTop: "16px"
          }}>
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px",
                    color: "var(--text-primary)",
                    fontWeight: "600"
                  }}>
                    Document Name
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px",
                    color: "var(--text-primary)",
                    fontWeight: "600"
                  }}>
                    Type
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px",
                    color: "var(--text-primary)",
                    fontWeight: "600"
                  }}>
                    Destination
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px",
                    color: "var(--text-primary)",
                    fontWeight: "600"
                  }}>
                    Confidence
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px",
                    color: "var(--text-primary)",
                    fontWeight: "600"
                  }}>
                    Routed
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter((doc) => doc.status === "Routed")
                  .slice(0, 10)
                  .map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <button
                          onClick={() => handleDocumentClick(doc)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent-primary)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {doc.name}
                        </button>
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.type || "-"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            background: "var(--success)",
                            color: "white",
                          }}
                        >
                          {doc.destination}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.confidence
                          ? `${(doc.confidence * 100).toFixed(1)}%`
                          : "-"}
                      </td>
                      <td style={{ 
                        padding: "12px 8px",
                        color: "var(--text-secondary)"
                      }}>
                        {doc.timestamps?.routed
                          ? new Date(doc.timestamps.routed).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ margin: "16px 0", color: "#2563eb", fontWeight: 500 }}>
        {selectedId
          ? documents.find((d) => d.id === selectedId)?.messages?.route ||
            "Routing status unavailable."
          : "Select or upload a document to route."}
      </div>

      <div className="pipeline-section">
        <div className="section-title">Document Types Distribution</div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Breakdown of classified document types and accuracy metrics
        </p>
        
        {(() => {
          // Calculate document type distribution
          const typeStats = {};
          const totalDocuments = documents.length;
          
          documents.forEach(doc => {
            if (doc.type) {
              if (!typeStats[doc.type]) {
                typeStats[doc.type] = {
                  count: 0,
                  totalConfidence: 0,
                  destinations: new Set()
                };
              }
              typeStats[doc.type].count++;
              if (doc.confidence) {
                typeStats[doc.type].totalConfidence += doc.confidence;
              }
              if (doc.destination) {
                typeStats[doc.type].destinations.add(doc.destination);
              }
            }
          });

          const documentTypes = Object.entries(typeStats).map(([type, stats]) => ({
            type,
            count: stats.count,
            percentage: ((stats.count / totalDocuments) * 100).toFixed(1),
            avgConfidence: stats.count > 0 ? (stats.totalConfidence / stats.count * 100).toFixed(1) : 0,
            destinations: Array.from(stats.destinations)
          })).sort((a, b) => b.count - a.count);

          // Calculate overall metrics
          const classifiedDocs = documents.filter(doc => doc.status === "Classified" || doc.status === "Routed");
          const avgConfidence = classifiedDocs.length > 0 
            ? (classifiedDocs.reduce((sum, doc) => sum + (doc.confidence || 0), 0) / classifiedDocs.length * 100).toFixed(1)
            : 0;
          
          const routingAccuracy = documents.filter(doc => doc.destination && doc.status === "Routed").length;
          const totalRouted = documents.filter(doc => doc.status === "Routed").length;

          if (documentTypes.length === 0) {
            return (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-title">No classification data available</div>
                <div className="empty-description">
                  Process documents to see AI classification results
                </div>
              </div>
            );
          }

          return (
            <div style={{ display: "grid", gap: "20px" }}>
              {/* Overall Metrics */}
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <h3 style={{ 
                  margin: "0 0 16px 0", 
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  fontWeight: "600"
                }}>
                  📈 Overall Metrics
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "var(--accent-primary)",
                      marginBottom: "4px"
                    }}>
                      {totalDocuments}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "var(--text-secondary)" 
                    }}>
                      Total Documents
                    </div>
                  </div>
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#10b981",
                      marginBottom: "4px"
                    }}>
                      {classifiedDocs.length}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "var(--text-secondary)" 
                    }}>
                      Classified
                    </div>
                  </div>
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#f59e0b",
                      marginBottom: "4px"
                    }}>
                      {avgConfidence}%
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "var(--text-secondary)" 
                    }}>
                      Avg Confidence
                    </div>
                  </div>
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#3b82f6",
                      marginBottom: "4px"
                    }}>
                      {totalRouted}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "var(--text-secondary)" 
                    }}>
                      Routed
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Type Breakdown */}
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <h3 style={{ 
                  margin: "0 0 16px 0", 
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  fontWeight: "600"
                }}>
                  📋 Document Type Breakdown
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {documentTypes.map((typeData, index) => (
                    <div key={typeData.type} style={{ 
                      padding: "16px", 
                      background: "var(--bg-primary)", 
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "8px"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "12px"
                        }}>
                          <div style={{ 
                            width: "12px", 
                            height: "12px", 
                            borderRadius: "50%",
                            background: `hsl(${index * 60}, 70%, 60%)`
                          }}></div>
                          <span style={{ 
                            fontWeight: "600", 
                            color: "var(--text-primary)",
                            fontSize: "16px"
                          }}>
                            {typeData.type}
                          </span>
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "16px"
                        }}>
                          <span style={{ 
                            fontSize: "14px", 
                            color: "var(--text-secondary)" 
                          }}>
                            {typeData.count} docs ({typeData.percentage}%)
                          </span>
                          <span style={{ 
                            fontSize: "14px", 
                            color: "var(--text-secondary)" 
                          }}>
                            {typeData.avgConfidence}% confidence
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div style={{ 
                        width: "100%", 
                        height: "6px", 
                        background: "var(--bg-tertiary)", 
                        borderRadius: "3px",
                        overflow: "hidden",
                        marginBottom: "8px"
                      }}>
                        <div style={{ 
                          width: `${typeData.percentage}%`, 
                          height: "100%", 
                          background: `hsl(${index * 60}, 70%, 60%)`,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                      
                      {/* Destinations */}
                      {typeData.destinations.length > 0 && (
                        <div style={{ 
                          fontSize: "12px", 
                          color: "var(--text-secondary)",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px"
                        }}>
                          <span>Routed to:</span>
                          {typeData.destinations.map((dest, destIndex) => (
                            <span key={destIndex} style={{ 
                              padding: "2px 6px", 
                              background: "var(--bg-tertiary)", 
                              borderRadius: "10px",
                              fontSize: "11px"
                            }}>
                              {dest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Accuracy Metrics */}
              <div style={{ 
                background: "var(--bg-secondary)", 
                padding: "20px", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <h3 style={{ 
                  margin: "0 0 16px 0", 
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  fontWeight: "600"
                }}>
                  🎯 Accuracy Metrics
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "8px"
                    }}>
                      <span style={{ fontSize: "16px" }}>📊</span>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "var(--text-primary)" 
                      }}>
                        Classification Rate
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#10b981",
                      marginBottom: "4px"
                    }}>
                      {totalDocuments > 0 ? ((classifiedDocs.length / totalDocuments) * 100).toFixed(1) : 0}%
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "var(--text-secondary)" 
                    }}>
                      {classifiedDocs.length} of {totalDocuments} documents classified
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "8px"
                    }}>
                      <span style={{ fontSize: "16px" }}>🎯</span>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "var(--text-primary)" 
                      }}>
                        Routing Success
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#3b82f6",
                      marginBottom: "4px"
                    }}>
                      {classifiedDocs.length > 0 ? ((totalRouted / classifiedDocs.length) * 100).toFixed(1) : 0}%
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "var(--text-secondary)" 
                    }}>
                      {totalRouted} of {classifiedDocs.length} classified documents routed
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: "16px", 
                    background: "var(--bg-primary)", 
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "8px"
                    }}>
                      <span style={{ fontSize: "16px" }}>⚡</span>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "var(--text-primary)" 
                      }}>
                        Processing Speed
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#f59e0b",
                      marginBottom: "4px"
                    }}>
                      ~10s
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "var(--text-secondary)" 
                    }}>
                      Average time per document
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {previewDocument && (
        <DocumentPreview 
          document={previewDocument} 
          onClose={handleClosePreview} 
        />
      )}
    </div>
  );
}
