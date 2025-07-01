import React, { useEffect, useState } from "react";
import { listDocuments } from "../api";

export default function Analytics() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDocuments()
      .then((response) => {
        // Handle the response structure from backend
        if (response.success && Array.isArray(response.documents)) {
          setDocuments(response.documents);
        } else if (Array.isArray(response)) {
          // Fallback: if response is directly an array
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
  }, []);

  // Example analytics calculations
  const totalProcessed = documents.filter((d) => d.status === "Routed").length;
  const totalDocs = documents.length;
  const errorRate = 0; // Placeholder, update if error tracking is added
  const accuracy =
    documents.length > 0
      ? (
          (documents.filter((d) => d.confidence >= 0.9).length /
            documents.length) *
          100
        ).toFixed(2)
      : 0;
  const processingSpeed =
    totalDocs > 0 ? (totalProcessed / (totalDocs || 1)).toFixed(2) : 0;

  const metrics = [
    {
      title: "Processing Speed",
      value: processingSpeed,
      unit: "docs/min",
      icon: "⚡",
      color: "#1e3a8a",
    },
    {
      title: "Accuracy Rate",
      value: accuracy,
      unit: "%",
      icon: "🎯",
      color: "#1d4ed8",
    },
    {
      title: "Total Processed",
      value: totalProcessed,
      unit: "documents",
      icon: "📊",
      color: "#2563eb",
    },
    {
      title: "Error Rate",
      value: errorRate,
      unit: "%",
      icon: "⚠️",
      color: "#3730a3",
    },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title section-darkblue-light">
          <span style={{ marginRight: "12px" }}>📈</span>
          Analytics
        </h1>
        <p className="dashboard-subtitle">
          Real-time analytics and insights from document workflow
        </p>
      </div>
      <div className="stats-grid">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ borderLeft: `6px solid ${metric.color}` }}
          >
            <div className="stat-icon">{metric.icon}</div>
            <div className="stat-title">{metric.title}</div>
            <div className="stat-value">
              {metric.value} {metric.unit}
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">AI Performance Insights</h2>
        </div>
        <table style={{ width: "100%", marginTop: 16 }}>
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
                <td>{doc.name}</td>
                <td>{doc.status}</td>
                <td>{doc.type || "-"}</td>
                <td>{doc.confidence || "-"}</td>
                <td>{doc.destination || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ margin: "16px 0", color: "#1e3a8a", fontWeight: 500 }}>
        {documents.length > 0
          ? documents[0].messages?.route || "No analytics available yet."
          : "No documents processed yet."}
      </div>
    </div>
  );
}
