#  ChopChop - Customer Food Delivery App

**Fast, reliable food delivery from your favorite restaurants**

![ChopChop Logo](https://chopchop.com/logo.png)

##  Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/malcolmonix/ChopChop.git
   cd ChopChop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view ChopChop in your browser.

##  Features

###  Customer Experience
- **Restaurant Discovery** - Browse local restaurants and cuisines
- **Real-time Menu** - View updated menus with pricing and availability
- **Smart Cart** - Add items from multiple restaurants
- **Order Tracking** - Real-time delivery status updates
- **Payment Integration** - Secure payments via Stripe
- **User Profiles** - Save addresses, payment methods, and preferences

###  Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query, Apollo Client
- **Authentication**: Firebase Auth
- **Payments**: Stripe Integration
- **Testing**: Jest, Playwright, Testing Library
- **Build**: Docker containerization

##  Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (optional)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # Run tests for CI
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run E2E tests with UI

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
npm run docker:dev   # Build and run development container
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# GraphQL API
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# App Configuration
NEXT_PUBLIC_APP_NAME=ChopChop
NEXT_PUBLIC_API_URL=http://localhost:3000
```

##  Docker Deployment

### Build and Run Locally
```bash
# Build the image
docker build -t chopchop:latest .

# Run the container
docker run -p 3000:3000 chopchop:latest
```

### Production Deployment
```bash
# Build for production
docker build -t chopchop:prod .

# Deploy to your server
docker run -d --name chopchop-app -p 3000:3000 chopchop:prod
```

##  Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

##  API Integration

ChopChop connects to the following services:

- **GraphQL API** - Restaurant data, orders, user management
- **Firebase** - Authentication, real-time updates
- **Stripe** - Payment processing
- **Google Maps** - Location services

##  Configuration

### Next.js Configuration
The app uses Next.js 14 with:
- TypeScript support
- Tailwind CSS integration
- PWA capabilities
- Image optimization
- API routes

### Tailwind CSS
Custom styling with:
- Brand colors
- Component utilities
- Responsive design
- Dark mode support

##  Mobile Support

ChopChop is built mobile-first with:
- Responsive design
- Touch-friendly interface
- PWA capabilities
- Offline support

##  Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build production image
docker build -t chopchop:prod .

# Run in production
docker run -d -p 3000:3000 chopchop:prod
```

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

- **Email**: support@chopchop.com
- **Issues**: [GitHub Issues](https://github.com/malcolmonix/ChopChop/issues)
- **Docs**: [Documentation](https://docs.chopchop.com)

##  Acknowledgments

- Built with Next.js and React
- UI components inspired by modern design systems
- Payment processing by Stripe
- Real-time features powered by Firebase

---

**ChopChop** - Fast food delivery, faster than ever! 
