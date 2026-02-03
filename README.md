# CEDTP - Compressed & Encrypted Data Transfer Protocol

A secure, efficient file transfer protocol with end-to-end encryption, adaptive compression, and ML-based malware detection.

## 🚀 Features

### Core Protocol
- ✅ **Chunk-based streaming** - Memory-safe transfer of files of any size
- ✅ **Adaptive compression** - Automatic selection of Gzip, Brotli, or no compression
- ✅ **End-to-end encryption** - ECDH key exchange + AES-256-GCM
- ✅ **Integrity verification** - Chunk-level ACK/NACK with automatic retry
- ✅ **Dual-side malware detection** - Random Forest ML scanner on sender and receiver

### Technology Stack
- **Backend**: Node.js, TypeScript, TCP/IP
- **Frontend**: React.js, TypeScript
- **Database**: MongoDB (transfer history and analytics)
- **Vector Store**: Pinecone (RAG for malware signature similarity)
- **ML**: Python, scikit-learn, Random Forest
- **Cryptography**: ECDH (prime256v1), AES-256-GCM, HKDF

### Advanced Features
- 📊 **Real-time dashboard** - Monitor transfers and statistics
- 🗄️ **Transfer history** - MongoDB persistence
- 🔍 **Vector similarity search** - Pinecone RAG for malware detection
- 📈 **Performance metrics** - Compression ratios, transfer speeds
- 🛡️ **Zero-trust security** - Validate at every step

## 📦 Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Python ML dependencies
pip install -r ml/requirements.txt
```

## 🔧 Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB URI
- Pinecone API key (optional, for RAG)
- API port
- Receiver port

## 🚀 Running the System

### Start MongoDB (required)
```bash
mongod
```

### Start API Server
```bash
npm run api
```

### Start Receiver
```bash
npm run receiver
```

### Start Frontend Dashboard
```bash
cd frontend
npm start
```

### Send a File
```bash
npm run sender
```

Or use the web interface at http://localhost:3001

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React.js  │─────▶│  Express API │─────▶│   MongoDB   │
│  Dashboard  │      │   (Node.js)  │      │  (History)  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Pinecone   │
                     │ (Vector RAG) │
                     └──────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│    Sender    │◀──────TCP/IP──────────▶│   Receiver   │
│  (Node.js)   │                        │  (Node.js)   │
└──────────────┘                        └──────────────┘
        │                                       │
        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│  ML Scanner  │                        │  ML Scanner  │
│   (Python)   │                        │   (Python)   │
└──────────────┘                        └──────────────┘
```

## 🔐 Security Pipeline

```
File → Malware Scan → Chunk → Compress → Encrypt → Send
                                                      ↓
                                                   Receive
                                                      ↓
                                    Decrypt → Decompress → Malware Scan → Save
```

## 📊 API Endpoints

- `GET /api/transfers` - List all transfers
- `GET /api/transfers/:id` - Get transfer details
- `GET /api/stats` - Get transfer statistics
- `POST /api/transfers` - Initiate new transfer

## 📝 Project Structure

```
cedtp/
├── src/
│   ├── api/              # Express API server
│   ├── database/         # MongoDB models and services
│   ├── ml/               # Pinecone RAG integration
│   ├── protocol/         # Core protocol (crypto, compression, codec)
│   ├── sender/           # Sender implementation
│   ├── receiver/         # Receiver implementation
│   └── shared/           # Shared utilities
├── frontend/             # React.js dashboard
├── ml/                   # Python ML scanner
├── docs/                 # Documentation
└── tests/                # Test suites
```

## 🎯 Use Cases

- Secure peer-to-peer file sharing
- Enterprise data transfer
- Backup and archival
- Secure cloud uploads
- Malware-free file distribution

## 📈 Performance

- **Memory**: Constant 4MB regardless of file size
- **Compression**: Up to 70% reduction on text files
- **Speed**: Network-limited (tested at 100MB/s)
- **Scalability**: Handles multi-GB files

## 📄 License

MIT License

## 👤 Author

Backend & Security Engineer

## 🔗 Links

- GitHub: https://github.com/Ajeetkumar1850/CEDT.git
