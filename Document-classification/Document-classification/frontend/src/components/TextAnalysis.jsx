
import React, { useState } from 'react';

export default function TextAnalysis({ extractedText, analysisResults, isProcessing }) {
  const [activeTab, setActiveTab] = useState('extracted');

  if (isProcessing) {
    return (
      <div className="text-analysis processing">
        <div className="analysis-header">
          <h3>Analysis in Progress</h3>
        </div>
        <div className="processing-content">
          <div className="spinner"></div>
          <p>Extracting text and analyzing document...</p>
          <div className="progress-steps">
            <div className="step active">📄 Reading document</div>
            <div className="step active">🔍 Extracting text</div>
            <div className="step">📊 Analyzing content</div>
            <div className="step">✅ Generating results</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-analysis">
      <div className="analysis-header">
        <h3>Analysis Results</h3>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'extracted' ? 'active' : ''}`}
            onClick={() => setActiveTab('extracted')}
          >
            Extracted Text
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>
      </div>

      <div className="analysis-content">
        {activeTab === 'extracted' && (
          <div className="extracted-text">
            <textarea 
              value={extractedText}
              readOnly
              className="text-output"
              placeholder="Extracted text will appear here..."
            />
          </div>
        )}

        {activeTab === 'insights' && analysisResults && (
          <div className="insights">
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-value">{analysisResults.confidence}%</div>
                <div className="metric-label">Confidence</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analysisResults.pages}</div>
                <div className="metric-label">Pages</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analysisResults.words}</div>
                <div className="metric-label">Words</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analysisResults.keyValuePairs}</div>
                <div className="metric-label">Key-Value Pairs</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analysisResults.tables}</div>
                <div className="metric-label">Tables</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analysisResults.language}</div>
                <div className="metric-label">Language</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
