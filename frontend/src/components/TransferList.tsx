import React from 'react';

interface Transfer {
  transferId: string;
  fileName: string;
  fileSize: number;
  status: string;
  completedChunks: number;
  totalChunks: number;
  malwareScanResult: string;
  startTime: string;
  transferSpeed: number;
}

interface TransferListProps {
  transfers: Transfer[];
}

const TransferList: React.FC<TransferListProps> = ({ transfers }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'in_progress': return '⏳';
      default: return '🔄';
    }
  };

  const getMalwareIcon = (result: string) => {
    switch (result) {
      case 'clean': return '🛡️';
      case 'malicious': return '⚠️';
      default: return '🔍';
    }
  };

  return (
    <div className="transfer-list">
      <h2>Recent Transfers</h2>
      
      {transfers.length === 0 ? (
        <div className="empty-state">No transfers yet</div>
      ) : (
        <table className="transfer-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>File Name</th>
              <th>Size</th>
              <th>Progress</th>
              <th>Speed</th>
              <th>Malware Scan</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.transferId}>
                <td>{getStatusIcon(transfer.status)}</td>
                <td className="file-name">{transfer.fileName}</td>
                <td>{formatFileSize(transfer.fileSize)}</td>
                <td>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(transfer.completedChunks / transfer.totalChunks) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {transfer.completedChunks}/{transfer.totalChunks} chunks
                  </span>
                </td>
                <td>{transfer.transferSpeed.toFixed(2)} MB/s</td>
                <td>{getMalwareIcon(transfer.malwareScanResult)}</td>
                <td>{new Date(transfer.startTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransferList;
