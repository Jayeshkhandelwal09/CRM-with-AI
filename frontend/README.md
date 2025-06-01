# CRM AI Frontend

Modern, responsive frontend for the AI-Powered CRM system built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 14**: Latest App Router with server components
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **ShadCN UI**: High-quality, accessible UI components
- **Glassmorphism Design**: Modern, clean aesthetic with subtle glass effects
- **Professional Color Palette**: Blue-based theme with status colors
- **Responsive Design**: Mobile-first approach with breakpoints
- **Font Optimization**: Inter and Roboto fonts with Next.js optimization

## 🎨 Design System

### Color Palette
- **Primary**: Blue 500 (#3b82f6) for actions and CTAs
- **Success**: Green 500 (#10b981) for won deals and success states
- **Warning**: Orange 500 (#f59e0b) for pending items
- **Error**: Red 500 (#ef4444) for lost deals and errors
- **Text**: Slate 800 (#1e293b) for primary text
- **Background**: Slate 50 (#f8fafc) for main background

### Typography
- **Primary Font**: Inter (400, 500, 600, 700)
- **Body Font**: Roboto (300, 400)
- **Scale**: H1 (32px), H2 (24px), H3 (20px), Body (16px), Label (14px), Caption (12px)

### Components
- **Glass Cards**: Semi-transparent backgrounds with blur effects
- **Button System**: Primary, Secondary, Ghost, and Danger variants
- **Status Indicators**: Color-coded badges for different states
- **AI Module Cards**: Special styling for AI-powered features

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0 or higher
- **Backend API**: CRM AI Backend running on port 5000

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=CRM AI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks

# Testing (when implemented)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard and main app pages
│   │   ├── globals.css        # Global styles and design system
│   │   ├── layout.tsx         # Root layout with fonts
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── layout/           # Layout components
│   │   ├── forms/            # Form components
│   │   └── charts/           # Chart components
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── contexts/             # React contexts
│   ├── services/             # API services
│   └── constants/            # Application constants
├── public/                   # Static assets
│   ├── icons/               # Icon assets
│   ├── images/              # Image assets
│   └── fonts/               # Custom fonts
└── components.json          # ShadCN UI configuration
```

## 🎯 Key Features Implementation

### Design System Classes

```css
/* Typography */
.text-h1, .text-h2, .text-h3    /* Heading styles */
.text-body, .text-label, .text-caption  /* Text styles */

/* Glassmorphism */
.glass-card                     /* Main glass card effect */
.glass-card-light              /* Lighter glass variant */
.ai-module-card                 /* AI-specific styling */

/* Buttons */
.btn-primary, .btn-secondary    /* Button variants */
.btn-ghost, .btn-danger         /* Additional button styles */

/* Status */
.status-success, .status-warning /* Status indicators */
.status-error, .status-info     /* More status variants */
```

### Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: md (768px+)
- **Desktop**: lg (1024px+)
- **Large**: xl (1280px+)

## 🔗 API Integration

The frontend connects to the backend API using:

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT tokens stored in localStorage
- **Error Handling**: Standardized error responses
- **Type Safety**: Full TypeScript coverage for API responses

## 🧪 Testing Strategy

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, hooks, utilities
- **Location**: `__tests__/` directories

### Integration Testing
- **Framework**: Playwright
- **Coverage**: User flows, API integration
- **Location**: `tests/` directory

### E2E Testing
- **Framework**: Playwright
- **Coverage**: Complete user journeys
- **Location**: `e2e/` directory

## 📱 Mobile Responsiveness

- **Mobile-first design** with progressive enhancement
- **Touch-friendly interfaces** with proper tap targets
- **Optimized navigation** with bottom tab bar on mobile
- **Swipeable components** for better mobile UX

## ⚡ Performance Optimizations

- **Next.js Image Optimization** for all images
- **Font Optimization** with next/font
- **Code Splitting** with dynamic imports
- **Bundle Analysis** with @next/bundle-analyzer
- **Lazy Loading** for non-critical components

## 🔒 Security Features

- **Environment Variables** for sensitive configuration
- **CSP Headers** via Next.js configuration
- **XSS Protection** with proper sanitization
- **CSRF Protection** with SameSite cookies

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t crm-ai-frontend .
docker run -p 3000:3000 crm-ai-frontend
```

### Static Export
```bash
npm run build
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the design system guidelines
4. Add tests for new features
5. Run linting and type checks
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**TypeScript errors:**
```bash
npm run type-check
```

**Styling issues:**
```bash
npm run build  # Check for CSS conflicts
```

**API connection issues:**
- Verify backend is running on port 5000
- Check CORS configuration
- Validate environment variables

## 📞 Support

For support and questions, please open an issue in the repository.
