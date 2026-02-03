import React, { useState } from 'react';

interface FileUploadProps {
  onUploadComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetHost, setTargetHost] = useState('localhost');
  const [targetPort, setTargetPort] = useState('9000');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('Initiating secure transfer...');

    try {
      // In a real implementation, this would trigger the actual CEDTP transfer
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`✅ Transfer initiated for ${selectedFile.name}`);
      setSelectedFile(null);
      onUploadComplete();
    } catch (error) {
      setMessage('❌ Transfer failed: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload File</h2>
      
      <div className="upload-form">
        <div className="form-group">
          <label>Select File:</label>
          <input 
            type="file" 
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <div className="file-info">
              <p>📄 {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Target Host:</label>
          <input 
            type="text" 
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label>Target Port:</label>
          <input 
            type="text" 
            value={targetPort}
            onChange={(e) => setTargetPort(e.target.value)}
            disabled={uploading}
          />
        </div>

        <button 
          className="upload-button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? '⏳ Transferring...' : '🚀 Start Secure Transfer'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="transfer-info">
        <h3>Transfer Process:</h3>
        <ol>
          <li>🔍 Malware scan (Random Forest ML)</li>
          <li>🗜️ Adaptive compression (Gzip/Brotli)</li>
          <li>🔐 AES-256-GCM encryption</li>
          <li>📡 Chunked transmission (4MB chunks)</li>
          <li>✅ Integrity verification (ACK/NACK)</li>
          <li>🛡️ Receiver-side malware scan</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUpload;
