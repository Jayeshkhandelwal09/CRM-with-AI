# 🚀 AI-Powered CRM with Intelligent Sales Assistant

<div align="center">

![AI CRM Banner](https://img.shields.io/badge/AI%20Powered-CRM%20System-blue?style=for-the-badge&logo=brain&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange?style=for-the-badge&logo=openai&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Database-purple?style=for-the-badge&logo=database&logoColor=white)

**A next-generation CRM that functions as a real-time AI assistant for sales professionals**

[🎯 Features](#-core-ai-features) • [🏗️ Architecture](#-system-architecture) • [🤖 AI Implementation](#-ai--rag-implementation) • [🚀 Quick Start](#-quick-start) • [📊 Demo](#-interactive-demo)

</div>

---

## 📋 Table of Contents

- [🎯 Core AI Features](#-core-ai-features)
- [🎯 ScreenShots](#-screenshots)
- [🏗️ System Architecture](#-system-architecture)
- [🤖 AI & RAG Implementation](#-ai--rag-implementation)
- [🗄️ Vector Database Integration](#️-vector-database-integration)
- [🔄 Data Flow & Processing](#-data-flow--processing)
- [💻 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📊 Interactive Demo](#-interactive-demo)
- [🔒 Security & Privacy](#-security--privacy)
- [📈 Performance & Scalability](#-performance--scalability)
- [🧪 Testing](#-testing)
- [📚 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)

---

## 🎯 Core AI Features

Our AI-powered CRM transforms traditional sales processes with four intelligent modules that provide real-time, contextual assistance:

### 🧠 1. Deal Coach AI
**Intelligent Deal Progression Assistant**

The Deal Coach AI analyzes your deals and provides actionable next steps based on:
- **Historical Deal Patterns**: Leverages similar successful deals from your database
- **Stage-Specific Logic**: Tailored suggestions based on current deal stage
- **Time-Based Triggers**: Identifies stagnant deals and suggests re-engagement strategies
- **Value-Based Prioritization**: Higher-value deals receive more sophisticated coaching

**Key Capabilities:**
- ✅ Analyzes deal metadata, past interactions, and objection patterns
- ✅ Provides 2-3 prioritized action items with confidence scores
- ✅ Uses RAG to retrieve top 5 most similar historical successful deals
- ✅ Considers industry match (40%), deal size (30%), and objection type (30%)

**Example Output:**
```
🎯 HIGH PRIORITY: Schedule decision-maker call
   Confidence: 85% | Based on 3 similar $50K+ deals
   
⏰ MEDIUM: Send detailed ROI proposal
   Confidence: 72% | 2 similar deals closed after ROI presentation
   
📞 LOW: Follow up on technical questions
   Confidence: 65% | Standard follow-up for this stage
```

### 👤 2. Customer Persona Builder
**AI-Powered Behavioral Analysis**

Automatically generates comprehensive customer profiles by analyzing:
- **Communication Patterns**: Formal vs. casual, response times, preferred channels
- **Decision-Making Style**: Analytical vs. intuitive, solo vs. committee-based
- **Objection Patterns**: Price-focused, feature-focused, or timeline-focused
- **Engagement Levels**: High, medium, or low responsiveness

**Intelligence Features:**
- 🔄 **Auto-Updates**: Refreshes after every 3 new interactions
- 🎯 **Contextual Insights**: Tailors communication recommendations
- 📊 **Behavioral Scoring**: Quantifies engagement and buying signals
- 🔍 **Pattern Recognition**: Identifies similar customer archetypes

### 🛡️ 3. Objection Handler
**Smart Response Generation System**

Provides intelligent, contextual responses to customer objections:
- **Multi-Angle Approach**: Logical, emotional, and social proof strategies
- **Tone Matching**: Adapts to customer's communication style
- **Context Awareness**: Considers deal stage, customer persona, and objection history
- **Follow-up Integration**: Includes conversation-continuing questions

**Response Strategy Framework:**
1. **Acknowledge** the concern professionally
2. **Address** with 2-3 different approach angles
3. **Advance** the conversation with strategic questions

### 📊 4. Win/Loss Explainer
**Deal Outcome Analysis Engine**

Provides comprehensive analysis of closed deals to improve future performance:
- **Timeline Analysis**: Compares deal duration to industry averages
- **Objection Impact**: Analyzes how objections affected the outcome
- **Stakeholder Engagement**: Evaluates decision-maker involvement
- **Competitive Factors**: Identifies competitive advantages/disadvantages

---

## 🎯 ScreenShots
<img width="1466" alt="Screenshot 2025-06-03 at 9 07 09 AM" src="https://github.com/user-attachments/assets/fcbef977-743c-4f02-87ad-30e0421a670d" />
<img width="1465" alt="Screenshot 2025-06-03 at 9 07 21 AM" src="https://github.com/user-attachments/assets/3571f6d8-ba20-4ffe-81bd-84fe48f0a1d1" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 07 34 AM" src="https://github.com/user-attachments/assets/1b9348ce-0f66-4883-b9f9-293e5d4b08d0" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 07 52 AM" src="https://github.com/user-attachments/assets/216d4d9b-14b8-49e2-9600-d8d100e02e33" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 08 03 AM" src="https://github.com/user-attachments/assets/30395940-dd80-4bf6-abbb-392492265edf" />
<img width="1469" alt="Screenshot 2025-06-03 at 9 08 14 AM" src="https://github.com/user-attachments/assets/56e9619b-7f95-42b7-96fe-cde35c6405c8" />
<img width="1468" alt="Screenshot 2025-06-03 at 9 09 13 AM" src="https://github.com/user-attachments/assets/a61b4c43-5f60-46e6-8044-289327662235" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 09 25 AM" src="https://github.com/user-attachments/assets/5949b96f-bf37-4fbc-b23f-ff528199425e" />
<img width="1467" alt="Screenshot 2025-06-03 at 9 09 35 AM" src="https://github.com/user-attachments/assets/13f54c7f-f687-46cd-bc29-cb0a8ecbbf2b" />
<img width="1462" alt="Screenshot 2025-06-03 at 9 09 47 AM" src="https://github.com/user-attachments/assets/d950cfef-c3fe-413c-a527-712516766cb5" />
<img width="1469" alt="Screenshot 2025-06-03 at 9 10 11 AM" src="https://github.com/user-attachments/assets/f54a0fc6-0905-48c3-a34c-81e5efb72c2f" />
<img width="1465" alt="Screenshot 2025-06-03 at 9 10 33 AM" src="https://github.com/user-attachments/assets/8805a684-962b-428f-94dd-ae4c55c048ec" />
<img width="1468" alt="Screenshot 2025-06-03 at 9 10 48 AM" src="https://github.com/user-attachments/assets/16fcd56b-82f0-4e4e-b40e-3ffdb18eec8e" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 10 55 AM" src="https://github.com/user-attachments/assets/9238b21b-7411-4249-9d2f-7df3157cfd8c" />
<img width="1470" alt="Screenshot 2025-06-03 at 9 11 15 AM" src="https://github.com/user-attachments/assets/0e947c20-2da3-40d2-ae13-20b08b821de8" />



## 🏗️ System Architecture

**Mermaid System Arch link : https://spiffy-dodol-911dbe.netlify.app/** 

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js UI Components]
        AI_COMP[AI Feature Components]
        DASH[Dashboard & Analytics]
    end
    
    subgraph "API Gateway"
        AUTH[Authentication Middleware]
        RATE[Rate Limiting]
        VALID[Input Validation]
    end
    
    subgraph "Business Logic Layer"
        AI_CTRL[AI Controller]
        DEAL_CTRL[Deal Controller]
        CONTACT_CTRL[Contact Controller]
    end
    
    subgraph "AI Services Layer"
        AI_SVC[AI Service]
        RAG_SVC[RAG Indexing Service]
        VECTOR_SVC[Vector Service]
        CONTENT_FILTER[Content Filter]
    end
    
    subgraph "External AI Services"
        OPENAI[OpenAI GPT-4 API]
        EMBED[OpenAI Embeddings API]
    end
    
    subgraph "Data Layer"
        MONGO[(MongoDB)]
        CHROMA[(ChromaDB Vector Store)]
        CACHE[In-Memory Cache]
    end
    
    UI --> AUTH
    AI_COMP --> AUTH
    DASH --> AUTH
    
    AUTH --> RATE
    RATE --> VALID
    VALID --> AI_CTRL
    VALID --> DEAL_CTRL
    VALID --> CONTACT_CTRL
    
    AI_CTRL --> AI_SVC
    AI_CTRL --> RAG_SVC
    
    AI_SVC --> VECTOR_SVC
    AI_SVC --> CONTENT_FILTER
    AI_SVC --> OPENAI
    
    VECTOR_SVC --> EMBED
    VECTOR_SVC --> CHROMA
    
    RAG_SVC --> VECTOR_SVC
    RAG_SVC --> MONGO
    
    DEAL_CTRL --> MONGO
    CONTACT_CTRL --> MONGO
    
    AI_SVC --> CACHE
    
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef business fill:#e8f5e8
    classDef ai fill:#fff3e0
    classDef external fill:#ffebee
    classDef data fill:#f1f8e9
    
    class UI,AI_COMP,DASH frontend
    class AUTH,RATE,VALID api
    class AI_CTRL,DEAL_CTRL,CONTACT_CTRL business
    class AI_SVC,RAG_SVC,VECTOR_SVC,CONTENT_FILTER ai
    class OPENAI,EMBED external
    class MONGO,CHROMA,CACHE data
```

---

## 🤖 AI & RAG Implementation

### 🧠 Retrieval-Augmented Generation (RAG) Architecture

Our RAG implementation enhances AI responses with contextual historical data:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AI_Controller
    participant AI_Service
    participant Vector_Service
    participant ChromaDB
    participant OpenAI
    participant MongoDB
    
    User->>Frontend: Request AI Suggestion
    Frontend->>AI_Controller: API Call with Context
    AI_Controller->>AI_Service: Process Request
    
    Note over AI_Service: Rate Limit Check (500/day)
    AI_Service->>AI_Service: Check Cache
    
    alt Cache Miss
        AI_Service->>Vector_Service: Search Similar Context
        Vector_Service->>OpenAI: Generate Query Embedding
        OpenAI-->>Vector_Service: Embedding Vector
        Vector_Service->>ChromaDB: Similarity Search
        ChromaDB-->>Vector_Service: Top 5 Similar Records
        Vector_Service-->>AI_Service: RAG Context
        
        AI_Service->>OpenAI: Generate Response with Context
        OpenAI-->>AI_Service: AI Response
        AI_Service->>AI_Service: Cache Response
    else Cache Hit
        AI_Service->>AI_Service: Return Cached Response
    end
    
    AI_Service->>MongoDB: Log AI Request
    AI_Service-->>AI_Controller: Structured Response
    AI_Controller-->>Frontend: JSON Response
    Frontend-->>User: Display AI Suggestions
```

### 🔍 Vector Database Strategy

**ChromaDB Collections:**

1. **`historical_deals`** - Deal Coach Context
   - Stores: Deal outcomes, timelines, objections, industry data
   - Similarity Factors: Industry (40%), Deal Size (30%), Objection Type (30%)
   - Time Limit: Last 12 months only

2. **`objection_responses`** - Objection Handler Context
   - Stores: Successful objection handling patterns
   - Metadata: Objection category, resolution success rate, industry

3. **`customer_interactions`** - Persona Builder Context
   - Stores: Communication patterns, response behaviors
   - Analysis: Tone, frequency, engagement levels

4. **`customer_personas`** - Persona Patterns
   - Stores: Behavioral profiles and traits
   - Matching: Similar personality patterns and decision-making styles

### 🎯 Context Retrieval Logic

```javascript
// Example: Deal Coach RAG Query
const dealContext = {
  industry: "SaaS",
  dealValue: 50000,
  stage: "proposal",
  objections: ["price", "timeline"],
  duration: 45 // days
};

// Vector search with weighted similarity
const similarDeals = await vectorService.searchSimilar('deals', dealContext, 5, {
  industry: dealContext.industry,
  outcome: 'closed_won',
  value: { $gte: dealContext.dealValue * 0.5, $lte: dealContext.dealValue * 2 }
});

// AI prompt with RAG context
const prompt = `
Based on these similar successful deals:
${similarDeals.map(deal => deal.summary).join('\n')}

Provide 3 actionable suggestions for current deal:
Industry: ${dealContext.industry}
Value: $${dealContext.dealValue}
Stage: ${dealContext.stage}
`;
```

### 🛡️ Content Filtering & Safety

**Multi-Layer Content Security:**

1. **Input Sanitization**: DOMPurify for XSS prevention
2. **Content Classification**: Inappropriate content detection
3. **Business Context Validation**: Ensures professional sales context
4. **Rate Limiting**: 500 AI requests per user per day
5. **Audit Logging**: Complete request/response tracking

---

## 🗄️ Vector Database Integration

### 📊 Embedding Generation Process

```mermaid
flowchart TD
    A[New CRM Data] --> B{Data Type?}
    
    B -->|Deal Closed| C[Extract Deal Context]
    B -->|Objection Resolved| D[Extract Objection Pattern]
    B -->|Interaction Logged| E[Extract Communication Pattern]
    
    C --> F[Generate Deal Summary]
    D --> G[Generate Objection Summary]
    E --> H[Generate Interaction Summary]
    
    F --> I[OpenAI Embedding API]
    G --> I
    H --> I
    
    I --> J[1536-dim Vector]
    
    J --> K{Store in ChromaDB}
    
    K --> L[historical_deals Collection]
    K --> M[objection_responses Collection]
    K --> N[customer_interactions Collection]
    
    L --> O[Available for Deal Coach]
    M --> P[Available for Objection Handler]
    N --> Q[Available for Persona Builder]
    
    style A fill:#e3f2fd
    style I fill:#fff3e0
    style K fill:#f3e5f5
```

### 🔄 Real-time Indexing Pipeline

**Automatic Data Indexing:**
- **Trigger Events**: Deal closure, objection resolution, interaction logging
- **Batch Processing**: 10 records per batch to optimize performance
- **Incremental Updates**: Only new/modified data is re-indexed
- **Background Processing**: Non-blocking indexing operations

**Index Optimization:**
```javascript
// Automatic reindexing on data changes
class RAGIndexingService {
  async handleDataUpdate(modelType, documentId, action = 'update') {
    switch (modelType) {
      case 'Deal':
        if (action === 'closed') {
          await this.reindexDeal(documentId);
        }
        break;
      case 'Objection':
        if (action === 'resolved') {
          await this.reindexObjection(documentId);
        }
        break;
      case 'Interaction':
        await this.reindexInteraction(documentId);
        break;
    }
  }
}
```

---

## 🔄 Data Flow & Processing

### 📈 AI Request Processing Pipeline

```mermaid
graph LR
    subgraph "Request Processing"
        A[User Request] --> B[Authentication]
        B --> C[Rate Limiting]
        C --> D[Input Validation]
        D --> E[Content Filtering]
    end
    
    subgraph "AI Processing"
        E --> F[Cache Check]
        F --> G{Cache Hit?}
        G -->|Yes| H[Return Cached]
        G -->|No| I[RAG Context Retrieval]
        I --> J[Generate AI Response]
        J --> K[Cache Response]
    end
    
    subgraph "Response Delivery"
        H --> L[Structure Response]
        K --> L
        L --> M[Add Metadata]
        M --> N[Log Request]
        N --> O[Return to User]
    end
    
    style A fill:#e8f5e8
    style J fill:#fff3e0
    style O fill:#e3f2fd
```

### 🎯 Confidence Scoring Algorithm

```javascript
calculateConfidence(response, ragContext = []) {
  let confidence = 50; // Base confidence
  
  // RAG context quality
  if (ragContext.length >= 3) confidence += 20;
  if (ragContext.some(ctx => ctx.similarity > 0.8)) confidence += 15;
  
  // Response characteristics
  if (response.includes('specific') || response.includes('based on')) confidence += 10;
  if (response.length > 100 && response.length < 300) confidence += 5;
  
  // Historical accuracy (if available)
  const historicalAccuracy = this.getHistoricalAccuracy(feature);
  confidence = Math.round(confidence * (historicalAccuracy / 100));
  
  return Math.min(Math.max(confidence, 10), 95); // Cap between 10-95%
}
```

---

## 💻 Technology Stack

### 🎨 Frontend Architecture
```
Next.js 15.3.3 (React 19)
├── 🎨 Styling: Tailwind CSS + ShadCN UI
├── 🔄 State Management: React Hooks + Context
├── 📱 Responsive Design: Mobile-first approach
├── 🌙 Theme Support: Dark/Light mode toggle
├── ⚡ Performance: Turbopack for fast builds
└── 🎭 Animations: Framer Motion + CSS transitions
```

### ⚙️ Backend Architecture
```
Node.js 18+ (Express.js)
├── 🗄️ Database: MongoDB with Mongoose ODM
├── 🤖 AI Integration: OpenAI GPT-4 + Embeddings API
├── 🔍 Vector Database: ChromaDB for RAG
├── 🔐 Authentication: JWT with bcrypt
├── 🛡️ Security: Helmet, CORS, Rate Limiting
├── 📝 Logging: Winston with structured logs
├── ✅ Validation: Express-validator + Joi
└── 🧪 Testing: Jest + Supertest
```

### 🤖 AI & ML Stack
```
OpenAI Integration
├── 🧠 Language Model: GPT-4 (gpt-4)
├── 📊 Embeddings: text-embedding-3-small (1536 dimensions)
├── 🎯 Temperature: 0.7 for balanced creativity/consistency
├── 📏 Token Limits: 400 tokens for suggestions, 800 for analysis
└── 💰 Cost Optimization: Response caching + rate limiting
```

### 🗄️ Data Architecture
```
Data Layer
├── 📊 Primary Database: MongoDB
│   ├── Users, Contacts, Deals, Interactions
│   ├── AI Logs, Sessions, Objections
│   └── Indexes on userId, dealId, timestamps
├── 🔍 Vector Database: ChromaDB
│   ├── 4 Collections (deals, objections, interactions, personas)
│   ├── Cosine similarity search
│   └── Metadata filtering
└── ⚡ Caching: In-memory cache (15min TTL)
```

---

## 🚀 Quick Start

### 📋 Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
MongoDB >= 5.0
Python >= 3.8 (for ChromaDB)
```

### 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/ai-powered-crm.git
cd ai-powered-crm
```

2. **Setup Backend**
```bash
cd backend
npm install

# Environment configuration
cp .env.example .env
# Add your OpenAI API key and MongoDB connection string
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Setup ChromaDB**
```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

5. **Environment Variables**
```bash
# Backend .env
# =============================================================================
# CRM AI Backend Environment Configuration
# =============================================================================

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crm-ai-dev
MONGODB_TEST_URI=mongodb://localhost:27017/crm-ai-test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here
AI_REQUESTS_PER_DAY=500

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/combined.log
ERROR_LOG_FILE=logs/error.log

# =============================================================================
# Development Notes:
# =============================================================================
# 1. Replace JWT secrets with strong random strings (min 32 characters)
# 2. Add your OpenAI API key for AI features to work
# 3. Configure SMTP settings for email functionality
# 4. For production, use environment-specific values
# =============================================================================

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 🚀 Running the Application

```bash
# Terminal 1: Start ChromaDB
chroma run --host localhost --port 8000

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ChromaDB: http://localhost:8000


### 📊 Initial Data Setup

```bash
# Seed database with sample data
cd backend
npm run seed

# Index existing data for RAG
curl -X POST http://localhost:3001/api/admin/index-data
```

---

## 📊 Interactive Demo

### 🎮 Try the AI Features

**1. Deal Coach Demo:**
```bash
# Create a sample deal
curl -X POST http://localhost:3001/api/deals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Enterprise SaaS Deal",
    "value": 50000,
    "stage": "proposal",
    "contactId": "CONTACT_ID"
  }'

# Get AI coaching suggestions
curl -X GET http://localhost:3001/api/deals/DEAL_ID/coach \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**2. Objection Handler Demo:**
```bash
# Handle a price objection
curl -X POST http://localhost:3001/api/objections/handle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "objectionText": "Your solution is too expensive for our budget",
    "dealId": "DEAL_ID",
    "category": "price",
    "severity": "high"
  }'
```

### 📈 Sample AI Responses

**Deal Coach Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "action": "Schedule decision-maker call",
        "priority": "high",
        "confidence": 85,
        "reasoning": "Based on 3 similar $50K+ deals that closed after executive involvement"
      },
      {
        "action": "Send detailed ROI analysis",
        "priority": "medium", 
        "confidence": 72,
        "reasoning": "2 similar deals in your industry closed after ROI presentation"
      }
    ],
    "ragContext": [
      {
        "similarity": 0.89,
        "industry": "SaaS",
        "outcome": "closed_won",
        "value": 45000
      }
    ]
  }
}
```

---

## 🔒 Security & Privacy

### 🛡️ Security Measures

**Authentication & Authorization:**
- JWT-based authentication with secure token storage
- Password hashing using bcryptjs (12 rounds)
- Session management with automatic expiration
- Role-based access control (planned for v2.0)

**API Security:**
- Rate limiting: 500 AI requests per user per day
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Request/response logging for audit trails

**Data Protection:**
- Content filtering for inappropriate inputs
- PII data handling with MongoDB encryption
- Secure API key management
- Regular security audits and updates

**AI Safety:**
- Content moderation for all AI inputs/outputs
- Prompt injection prevention
- Response filtering and validation
- Usage monitoring and anomaly detection

### 🔐 Privacy Compliance

**Data Handling:**
- Minimal data collection principle
- User consent for AI processing
- Data retention policies (2 years for interactions)
- Soft delete with 30-day recovery window
- Export functionality for data portability

---

## 📈 Performance & Scalability

### ⚡ Performance Optimizations

**Frontend Performance:**
- Next.js 15 with Turbopack for fast builds
- Component lazy loading and code splitting
- Image optimization and caching
- Service worker for offline functionality
- Bundle size optimization (< 500KB gzipped)

**Backend Performance:**
- Response caching (15-minute TTL)
- Database query optimization with indexes
- Connection pooling for MongoDB
- Batch processing for vector operations
- Background job processing for indexing

**AI Performance:**
- Response caching to reduce API calls
- Batch embedding generation
- Vector search optimization
- Token usage optimization
- Fallback responses for API failures

### 📊 Scalability Architecture

**Horizontal Scaling:**
- Stateless API design for load balancing
- Database sharding strategies
- CDN integration for static assets
- Microservices architecture (planned)
- Container orchestration with Docker

**Monitoring & Analytics:**
- Real-time performance monitoring
- AI usage analytics and cost tracking
- Error tracking and alerting
- User behavior analytics
- System health dashboards

---

## 🧪 Testing

### 🔬 Test Coverage

**Backend Testing:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Test Categories:**
- **Unit Tests**: Individual function testing (85% coverage)
- **Integration Tests**: API endpoint testing
- **AI Service Tests**: Mock OpenAI responses
- **Database Tests**: MongoDB operations
- **Security Tests**: Input validation and sanitization

**Frontend Testing:**
```bash
# Component testing with React Testing Library
npm run test:components

# E2E testing with Playwright
npm run test:e2e
```

### 📊 Test Results

```
Test Suites: 45 passed, 45 total
Tests:       312 passed, 312 total
Coverage:    85.2% statements, 82.1% branches
Time:        45.2s
```

---

## 📚 API Documentation

### 🔗 Core Endpoints

**Authentication:**
```
POST /api/auth/login     - User login
POST /api/auth/register  - User registration
POST /api/auth/refresh   - Token refresh
DELETE /api/auth/logout  - User logout
```

**AI Features:**
```
GET    /api/deals/:id/coach           - Get deal coaching suggestions
POST   /api/objections/handle         - Handle customer objections
GET    /api/contacts/:id/persona      - Get customer persona analysis
POST   /api/deals/:id/win-loss        - Analyze deal outcome
POST   /api/ai/feedback               - Submit AI feedback
```

**CRM Operations:**
```
GET    /api/deals                     - List deals with filters
POST   /api/deals                     - Create new deal
PUT    /api/deals/:id                 - Update deal
DELETE /api/deals/:id                 - Delete deal

GET    /api/contacts                  - List contacts
POST   /api/contacts                  - Create contact
PUT    /api/contacts/:id              - Update contact
```

**Analytics:**
```
GET    /api/analytics/dashboard       - Dashboard metrics
GET    /api/analytics/ai-usage        - AI usage statistics
GET    /api/analytics/performance     - Performance metrics
```

### 📖 Detailed API Documentation

Full API documentation with examples, request/response schemas, and authentication details is available at:
- **Swagger UI**: http://localhost:3001/api-docs (when running locally)
- **Postman Collection**: [Download Collection](./docs/postman-collection.json)

---

## 🤝 Contributing

### 🛠️ Development Setup

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
```bash
npm test
```

6. **Commit your changes**
```bash
git commit -m "Add amazing feature"
```

7. **Push to your branch**
```bash
git push origin feature/amazing-feature
```

8. **Open a Pull Request**

### 📝 Contribution Guidelines

**Code Standards:**
- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Maintain backward compatibility

**AI Feature Development:**
- Test with multiple scenarios and edge cases
- Implement proper error handling and fallbacks
- Add content filtering for new AI inputs
- Update RAG indexing for new data types
- Monitor token usage and costs

### 🐛 Bug Reports

Please use the [GitHub Issues](https://github.com/your-org/ai-powered-crm/issues) page to report bugs. Include:
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots or logs if applicable


## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 and Embeddings APIs
- **ChromaDB** for the excellent vector database solution
- **Next.js Team** for the amazing React framework
- **MongoDB** for the flexible document database
- **ShadCN** for the beautiful UI components
- **Vercel** for deployment and hosting solutions

\
---

<div align="center">

**Built with ❤️ by the AI CRM Team**

[![GitHub stars](https://img.shields.io/github/stars/your-org/ai-powered-crm?style=social)](https://github.com/your-org/ai-powered-crm/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-org/ai-powered-crm?style=social)](https://github.com/your-org/ai-powered-crm/network/members)
[![GitHub issues](https://img.shields.io/github/issues/your-org/ai-powered-crm)](https://github.com/your-org/ai-powered-crm/issues)

</div>
