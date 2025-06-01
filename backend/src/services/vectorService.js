const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const config = require('../config');

/**
 * Vector Database Service for RAG (Retrieval-Augmented Generation)
 * 
 * This service handles:
 * - Vector storage and retrieval using Chroma DB
 * - Embedding generation using OpenAI
 * - Similarity search for contextual AI responses
 * - Data indexing for deals, objections, interactions, and personas
 */
class VectorService {
  constructor() {
    this.chroma = null;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.collections = {
      deals: null,
      objections: null,
      interactions: null,
      personas: null
    };
    this.isInitialized = false;
  }

  /**
   * Initialize Chroma DB connection and collections
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Vector Database...');
      
      // Initialize Chroma client
      this.chroma = new ChromaClient({
        path: process.env.CHROMA_URL || 'http://localhost:8000'
      });

      // Create collections for different data types
      await this.createCollections();
      
      this.isInitialized = true;
      console.log('✅ Vector Database initialized successfully');
      
    } catch (error) {
      console.error('❌ Vector Database initialization failed:', error);
      throw new Error(`Vector DB initialization failed: ${error.message}`);
    }
  }

  /**
   * Create vector collections for different data types
   */
  async createCollections() {
    try {
      // Collection for historical deals (for Deal Coach)
      this.collections.deals = await this.chroma.getOrCreateCollection({
        name: 'historical_deals',
        metadata: { 
          description: 'Historical deal data for Deal Coach AI',
          hnsw_space: 'cosine'
        }
      });

      // Collection for objections and responses (for Objection Handler)
      this.collections.objections = await this.chroma.getOrCreateCollection({
        name: 'objection_responses',
        metadata: { 
          description: 'Objection patterns and successful responses',
          hnsw_space: 'cosine'
        }
      });

      // Collection for customer interactions (for Persona Builder)
      this.collections.interactions = await this.chroma.getOrCreateCollection({
        name: 'customer_interactions',
        metadata: { 
          description: 'Customer interaction patterns for persona building',
          hnsw_space: 'cosine'
        }
      });

      // Collection for customer personas
      this.collections.personas = await this.chroma.getOrCreateCollection({
        name: 'customer_personas',
        metadata: { 
          description: 'Customer persona patterns and traits',
          hnsw_space: 'cosine'
        }
      });

      console.log('✅ All vector collections created successfully');
      
    } catch (error) {
      console.error('❌ Failed to create collections:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text using OpenAI
   * @param {string} text - Text to generate embedding for
   * @returns {Array} - Embedding vector
   */
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty for embedding generation');
      }

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.trim(),
        encoding_format: 'float'
      });

      return response.data[0].embedding;
      
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Store vector in specified collection
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Unique identifier
   * @param {string} text - Text content
   * @param {Object} metadata - Additional metadata
   */
  async storeVector(collectionName, id, text, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const collection = this.collections[collectionName];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      // Generate embedding
      const embedding = await this.generateEmbedding(text);

      // Store in vector database
      await collection.add({
        ids: [id],
        embeddings: [embedding],
        metadatas: [metadata],
        documents: [text]
      });

      console.log(`✅ Vector stored in ${collectionName}: ${id}`);
      
    } catch (error) {
      console.error(`❌ Failed to store vector in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   * @param {string} collectionName - Name of the collection
   * @param {string} queryText - Text to search for
   * @param {number} limit - Number of results to return
   * @param {Object} whereFilter - Metadata filter
   * @returns {Array} - Similar vectors with metadata
   */
  async searchSimilar(collectionName, queryText, limit = 5, whereFilter = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const collection = this.collections[collectionName];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(queryText);

      // Search for similar vectors
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined
      });

      // Format results
      const formattedResults = [];
      if (results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.metadatas[0].length; i++) {
          formattedResults.push({
            id: results.ids[0][i],
            metadata: results.metadatas[0][i],
            document: results.documents[0][i],
            similarity: 1 - results.distances[0][i], // Convert distance to similarity
            distance: results.distances[0][i]
          });
        }
      }

      console.log(`🔍 Found ${formattedResults.length} similar items in ${collectionName}`);
      return formattedResults;
      
    } catch (error) {
      console.error(`❌ Similarity search failed in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update existing vector
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Unique identifier
   * @param {string} text - Updated text content
   * @param {Object} metadata - Updated metadata
   */
  async updateVector(collectionName, id, text, metadata = {}) {
    try {
      const collection = this.collections[collectionName];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      // Generate new embedding
      const embedding = await this.generateEmbedding(text);

      // Update in vector database
      await collection.update({
        ids: [id],
        embeddings: [embedding],
        metadatas: [metadata],
        documents: [text]
      });

      console.log(`✅ Vector updated in ${collectionName}: ${id}`);
      
    } catch (error) {
      console.error(`❌ Failed to update vector in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete vector from collection
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Unique identifier
   */
  async deleteVector(collectionName, id) {
    try {
      const collection = this.collections[collectionName];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      await collection.delete({
        ids: [id]
      });

      console.log(`✅ Vector deleted from ${collectionName}: ${id}`);
      
    } catch (error) {
      console.error(`❌ Failed to delete vector from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   * @param {string} collectionName - Name of the collection
   * @returns {Object} - Collection statistics
   */
  async getCollectionStats(collectionName) {
    try {
      const collection = this.collections[collectionName];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const count = await collection.count();
      return {
        name: collectionName,
        count: count,
        status: 'active'
      };
      
    } catch (error) {
      console.error(`❌ Failed to get stats for ${collectionName}:`, error);
      return {
        name: collectionName,
        count: 0,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Health check for vector database
   * @returns {Object} - Health status
   */
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { status: 'not_initialized', healthy: false };
      }

      // Check all collections
      const stats = {};
      for (const collectionName of Object.keys(this.collections)) {
        stats[collectionName] = await this.getCollectionStats(collectionName);
      }

      return {
        status: 'healthy',
        healthy: true,
        collections: stats,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = VectorService; 