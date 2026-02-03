import mongoose, { Schema, Document } from 'mongoose';

export interface ITransfer extends Document {
  transferId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  sender: string;
  receiver: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  totalChunks: number;
  completedChunks: number;
  compressionType: string;
  compressionRatio: number;
  malwareScanResult: 'clean' | 'malicious' | 'pending';
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
  bytesTransferred: number;
  transferSpeed: number;
}

const TransferSchema: Schema = new Schema({
  transferId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileHash: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['initiated', 'in_progress', 'completed', 'failed'],
    default: 'initiated'
  },
  totalChunks: { type: Number, required: true },
  completedChunks: { type: Number, default: 0 },
  compressionType: { type: String },
  compressionRatio: { type: Number, default: 0 },
  malwareScanResult: {
    type: String,
    enum: ['clean', 'malicious', 'pending'],
    default: 'pending'
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  errorMessage: { type: String },
  bytesTransferred: { type: Number, default: 0 },
  transferSpeed: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<ITransfer>('Transfer', TransferSchema);
