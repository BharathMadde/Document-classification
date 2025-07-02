import React, { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import { listDocuments } from "../api";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval = setInterval(() => {
      listDocuments()
        .then((response) => {
          if (response.success && Array.isArray(response.documents)) {
            setDocuments(response.documents);
          } else if (Array.isArray(response)) {
            setDocuments(response);
          } else {
            setDocuments([]);
            setError("Invalid response format from server");
          }
        })
        .catch((err) => {
          setError(err.message);
          setDocuments([]);
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Total Documents",
      value: documents.length,
      icon: "📄",
      color: "blue",
    },
    {
      title: "Processed",
      value: documents.filter((d) => d.status === "Routed").length,
      icon: "✅",
      color: "green",
    },
    {
      title: "Processing",
      value: documents.filter(
        (d) => d.status !== "Routed" && d.status !== "Ingested" && d.status !== "Human Intervention"
      ).length,
      icon: "⚡",
      color: "yellow",
    },
    { 
      title: "Human Intervention", 
      value: documents.filter((d) => d.status === "Human Intervention").length, 
      icon: "👀", 
      color: "red" 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ingested': return '#1e3a8a';
      case 'Extracted': return '#1d4ed8';
      case 'Classified': return '#2563eb';
      case 'Routed': return '#059669';
      case 'Human Intervention': return '#dc2626';
      case 'Low Confidence': return '#f59e0b';
      case 'Manual Review': return '#dc2626';
      case 'Unclassified': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatConfidence = (confidence) => {
    if (confidence === null || confidence === undefined) return '-';
    if (typeof confidence === 'number') {
      return `${Math.round(confidence * 100)}%`;
    }
    return confidence;
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title section-darkblue-light">
          <span style={{ marginRight: "12px", verticalAlign: "middle" }}>
            <BarChart2 size={32} color="#3b82f6" />
          </span>
          Document Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Real-time document stats and workflow overview
        </p>
      </div>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ borderLeft: `6px solid ${stat.color}` }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Documents</h2>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <table
          style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "center", padding: "8px" }}>Name</th>
              <th style={{ textAlign: "center", padding: "8px" }}>Status</th>
              <th style={{ textAlign: "center", padding: "8px" }}>Type</th>
              <th style={{ textAlign: "center", padding: "8px" }}>
                Classification Confidence
              </th>
              <th style={{ textAlign: "center", padding: "8px" }}>
                Extraction Confidence
              </th>
              <th style={{ textAlign: "center", padding: "8px" }}>
                Routing Confidence
              </th>
              <th style={{ textAlign: "center", padding: "8px" }}>
                Destination
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                    fontWeight: "500"
                  }}
                >
                  {doc.name}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  <span style={{
                    background: getStatusColor(doc.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                  }}>
                    {doc.status}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {doc.type || "-"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {formatConfidence(doc.confidence)}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {formatConfidence(doc.extractionConfidence)}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {formatConfidence(doc.routingConfidence)}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {doc.status === "Human Intervention" ? "Human Intervention" : (doc.destination || "-")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
