import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';
import TransferList from './components/TransferList';
import FileUpload from './components/FileUpload';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transfers' | 'upload'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTransfers();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchTransfers();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transfers?limit=50`);
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔒 CEDTP - Secure File Transfer Protocol</h1>
        <p>Compressed & Encrypted Data Transfer with ML-Based Malware Detection</p>
      </header>

      <nav className="App-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'transfers' ? 'active' : ''}
          onClick={() => setActiveTab('transfers')}
        >
          📁 Transfers
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          ⬆️ Upload
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'transfers' && <TransferList transfers={transfers} />}
        {activeTab === 'upload' && <FileUpload onUploadComplete={fetchTransfers} />}
      </main>

      <footer className="App-footer">
        <p>CEDTP v1.0 | End-to-End Encrypted | ML-Powered Security</p>
      </footer>
    </div>
  );
}

export default App;
