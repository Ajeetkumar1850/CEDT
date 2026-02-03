import Transfer, { ITransfer } from '../models/Transfer';
import crypto from 'crypto';

export class TransferService {
  static async createTransfer(data: {
    fileName: string;
    fileSize: number;
    fileHash: string;
    sender: string;
    receiver: string;
    totalChunks: number;
  }): Promise<ITransfer> {
    const transferId = crypto.randomUUID();
    
    const transfer = new Transfer({
      transferId,
      ...data,
      status: 'initiated'
    });
    
    await transfer.save();
    return transfer;
  }
  
  static async updateTransferProgress(
    transferId: string,
    completedChunks: number,
    bytesTransferred: number
  ): Promise<void> {
    await Transfer.findOneAndUpdate(
      { transferId },
      {
        completedChunks,
        bytesTransferred,
        status: 'in_progress'
      }
    );
  }
  
  static async completeTransfer(
    transferId: string,
    compressionRatio: number,
    transferSpeed: number
  ): Promise<void> {
    await Transfer.findOneAndUpdate(
      { transferId },
      {
        status: 'completed',
        endTime: new Date(),
        compressionRatio,
        transferSpeed
      }
    );
  }
  
  static async failTransfer(
    transferId: string,
    errorMessage: string
  ): Promise<void> {
    await Transfer.findOneAndUpdate(
      { transferId },
      {
        status: 'failed',
        endTime: new Date(),
        errorMessage
      }
    );
  }
  
  static async updateMalwareScan(
    transferId: string,
    result: 'clean' | 'malicious'
  ): Promise<void> {
    await Transfer.findOneAndUpdate(
      { transferId },
      { malwareScanResult: result }
    );
  }
  
  static async getTransferById(transferId: string): Promise<ITransfer | null> {
    return Transfer.findOne({ transferId });
  }
  
  static async getAllTransfers(limit: number = 100): Promise<ITransfer[]> {
    return Transfer.find()
      .sort({ startTime: -1 })
      .limit(limit);
  }
  
  static async getTransferStats() {
    const total = await Transfer.countDocuments();
    const completed = await Transfer.countDocuments({ status: 'completed' });
    const failed = await Transfer.countDocuments({ status: 'failed' });
    const inProgress = await Transfer.countDocuments({ status: 'in_progress' });
    
    const avgSpeed = await Transfer.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgSpeed: { $avg: '$transferSpeed' } } }
    ]);
    
    return {
      total,
      completed,
      failed,
      inProgress,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      averageSpeed: avgSpeed[0]?.avgSpeed || 0
    };
  }
}
