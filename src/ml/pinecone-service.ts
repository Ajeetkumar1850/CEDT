import { Pinecone } from '@pinecone-database/pinecone';
import crypto from 'crypto';
import { logger } from '../shared/logger';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'malware-signatures';

export class PineconeService {
  private pinecone: Pinecone | null = null;
  private index: any;
  
  constructor() {
    if (!PINECONE_API_KEY) {
      logger.warn('Pinecone API key not configured, vector search disabled');
      return;
    }
    
    this.pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY
    });
  }
  
  async initialize() {
    try {
      if (!this.pinecone) {
        logger.warn('Pinecone not initialized, skipping index setup');
        return;
      }
      this.index = this.pinecone.index(PINECONE_INDEX);
      logger.info('Pinecone initialized successfully');
    } catch (error) {
      logger.error(`Pinecone initialization error: ${error}`);
    }
  }
  
  /**
   * Generate feature vector from file characteristics
   */
  generateFeatureVector(features: {
    fileSize: number;
    entropy: number;
    printableRatio: number;
    nullRatio: number;
  }): number[] {
    // Normalize features to 0-1 range for vector embedding
    const normalized = [
      Math.log10(features.fileSize + 1) / 10, // Log scale for file size
      features.entropy / 8, // Max entropy is 8 bits
      features.printableRatio,
      features.nullRatio
    ];
    
    // Pad to 128 dimensions (common embedding size)
    const vector = new Array(128).fill(0);
    normalized.forEach((val, idx) => {
      vector[idx] = val;
    });
    
    return vector;
  }
  
  /**
   * Store malware signature in vector database
   */
  async storeMalwareSignature(
    fileHash: string,
    features: {
      fileSize: number;
      entropy: number;
      printableRatio: number;
      nullRatio: number;
    },
    metadata: {
      fileName: string;
      detectionDate: string;
      malwareFamily?: string;
    }
  ): Promise<void> {
    if (!this.index) return;
    
    try {
      const vector = this.generateFeatureVector(features);
      
      await this.index.upsert([{
        id: fileHash,
        values: vector,
        metadata: {
          ...metadata,
          ...features
        }
      }]);
      
      logger.info(`Stored malware signature: ${fileHash}`);
    } catch (error) {
      logger.error(`Error storing malware signature: ${error}`);
    }
  }
  
  /**
   * Search for similar malware signatures using RAG
   */
  async searchSimilarMalware(
    features: {
      fileSize: number;
      entropy: number;
      printableRatio: number;
      nullRatio: number;
    },
    topK: number = 5
  ): Promise<{
    matches: Array<{
      id: string;
      score: number;
      metadata: any;
    }>;
    isSuspicious: boolean;
  }> {
    if (!this.index) {
      return { matches: [], isSuspicious: false };
    }
    
    try {
      const vector = this.generateFeatureVector(features);
      
      const queryResponse = await this.index.query({
        vector,
        topK,
        includeMetadata: true
      });
      
      const matches = queryResponse.matches || [];
      
      // If any match has similarity > 0.9, consider suspicious
      const isSuspicious = matches.some((match: any) => match.score > 0.9);
      
      logger.info(`Found ${matches.length} similar signatures, suspicious: ${isSuspicious}`);
      
      return {
        matches: matches.map((match: any) => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata
        })),
        isSuspicious
      };
    } catch (error) {
      logger.error(`Error searching malware signatures: ${error}`);
      return { matches: [], isSuspicious: false };
    }
  }
  
  /**
   * Enhanced malware detection using RAG
   */
  async enhancedMalwareDetection(
    filePath: string,
    features: {
      fileSize: number;
      entropy: number;
      printableRatio: number;
      nullRatio: number;
    }
  ): Promise<{
    isClean: boolean;
    confidence: number;
    similarMalware: string[];
    reason: string;
  }> {
    // Search for similar known malware
    const { matches, isSuspicious } = await this.searchSimilarMalware(features);
    
    if (isSuspicious) {
      return {
        isClean: false,
        confidence: matches[0]?.score || 0,
        similarMalware: matches.map(m => m.id),
        reason: `Similar to known malware: ${matches[0]?.metadata?.malwareFamily || 'unknown'}`
      };
    }
    
    return {
      isClean: true,
      confidence: 1.0 - (matches[0]?.score || 0),
      similarMalware: [],
      reason: 'No similar malware signatures found'
    };
  }
}

// Singleton instance
export const pineconeService = new PineconeService();
