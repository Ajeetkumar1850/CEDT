import express from 'express';
import cors from 'cors';
import { connectDatabase } from '../database/connection';
import { TransferService } from '../database/services/TransferService';
import { logger } from '../shared/logger';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all transfers
app.get('/api/transfers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const transfers = await TransferService.getAllTransfers(limit);
    res.json({ success: true, data: transfers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transfer by ID
app.get('/api/transfers/:id', async (req, res) => {
  try {
    const transfer = await TransferService.getTransferById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, error: 'Transfer not found' });
    }
    res.json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transfer statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await TransferService.getTransferStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start transfer (placeholder - actual transfer happens via TCP)
app.post('/api/transfers', async (req, res) => {
  try {
    const { fileName, fileSize, fileHash, sender, receiver, totalChunks } = req.body;
    
    const transfer = await TransferService.createTransfer({
      fileName,
      fileSize,
      fileHash,
      sender,
      receiver,
      totalChunks
    });
    
    res.json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export async function startAPIServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start API server: ${error}`);
    process.exit(1);
  }
}
