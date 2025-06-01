# CRM AI Backend

AI-Powered CRM Backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **Contact Management**: CRUD operations with 2,000 contacts per user limit
- **Deal Pipeline**: Deal management with stage progression (5,000 deals per user)
- **AI Integration**: Ready for AI-powered features (100 requests/day limit)
- **CSV Import/Export**: Bulk operations with 1,000 records limit
- **Rate Limiting**: API protection with configurable limits
- **Comprehensive Logging**: Winston-based structured logging
- **Security**: Helmet, CORS, input validation, and sanitization

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v5.0 or higher
- **npm**: v8.0 or higher

## 🛠️ Installation

### 1. Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download and install from [MongoDB Official Website](https://www.mongodb.com/try/download/community)

### 2. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Environment Configuration

Update the `.env` file with your settings:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/crm-ai-dev

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Other configurations...
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### API Information
```
GET /api
```

### Available Endpoints (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/deals` - List deals
- `POST /api/deals` - Create deal
- `POST /api/ai/*` - AI-powered features

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── database/        # Database connection
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── logs/                # Application logs
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Express-validator
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs

## 📊 Application Limits

- **Contacts per user**: 2,000
- **Deals per user**: 5,000
- **CSV import records**: 1,000 max
- **AI requests per day**: 100
- **File upload size**: 5MB max

## 🧪 Testing

The project uses Jest for testing with the following setup:
- Unit tests for controllers, services, models, and utilities
- Integration tests for API endpoints
- Test database isolation
- Coverage reporting

## 📝 Logging

Winston-based logging with:
- Console output in development
- File logging in production
- Error and combined log files
- Structured JSON format

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set in production:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

### Docker Support (Coming Soon)

```bash
docker build -t crm-ai-backend .
docker run -p 5000:5000 crm-ai-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## 📞 Support

For support and questions, please open an issue in the repository. 