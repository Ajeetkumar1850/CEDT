import React from 'react';

interface DashboardProps {
  stats: any;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  if (!stats) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Transfer Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Transfers</div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-value">{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.successRate.toFixed(1)}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.averageSpeed.toFixed(2)} MB/s</div>
          <div className="stat-label">Avg Speed</div>
        </div>
      </div>

      <div className="features">
        <h3>Security Features</h3>
        <ul>
          <li>✅ End-to-End AES-256-GCM Encryption</li>
          <li>✅ ECDH Key Exchange with Forward Secrecy</li>
          <li>✅ Adaptive Lossless Compression (Gzip/Brotli)</li>
          <li>✅ Dual-Side ML-Based Malware Detection</li>
          <li>✅ Chunk-Level Integrity Verification</li>
          <li>✅ Vector Similarity Search (Pinecone RAG)</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
