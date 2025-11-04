# ChopChop - Fast Food Delivery App

🍕 **ChopChop** is a modern, fast food delivery application built with Next.js and TypeScript.

## 🚀 **PRODUCTION READY - LIVE AT https://chopchop.com**

**Status**: ✅ **Fully Operational** - End-to-end order flow working in production

## Features

### ✅ **MVP Features (Implemented)**
- 🏪 Browse restaurants and menus
- 🛒 Shopping cart and checkout
- 📱 Mobile-responsive design
- � Location-based restaurant discovery
- � **Live Order Sync**: Real-time synchronization with MenuVerse vendor dashboard
- 💰 **Cash on Delivery**: Payment method currently supported

### 🚧 **Future Enhancements (Not Yet Implemented)**
- 💳 Payment gateway integrations (Stripe, PayPal, etc.)
- ⭐ Customer reviews and ratings system
- 🚚 Advanced order tracking with GPS
- � Mobile apps (iOS/Android)
- 🔔 Push notifications for order updates
- 📊 Order history and past orders

## Tech Stack

- **Framework**: Next.js 14.2.33
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **API**: GraphQL (Apollo Client 4.0.9)
- **Database**: Firebase Firestore (Real-time)
- **Authentication**: Firebase Auth
- **Deployment**: Docker + GitHub Actions CI/CD
- **Infrastructure**: VPS with automated deployments

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone https://github.com/malcolmonix/ChopChop.git
cd ChopChop

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=ChopChop
NEXT_PUBLIC_API_URL=https://api.chopchop.com/graphql
NEXT_PUBLIC_MENUVERSE_URL=https://menuverse.com

# Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Features
NEXT_PUBLIC_ENABLE_REAL_TIME_TRACKING=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run type-check   # TypeScript type checking
```

## Docker

```bash
# Build Docker image
docker build -t chopchop:latest .

# Run container
docker run -p 3000:3000 chopchop:latest
```

## Deployment

### 🚀 **Production Deployment (Automated)**
- **Live URL**: https://chopchop.com
- **CI/CD**: GitHub Actions with automated deployment on every push to `main`
- **Infrastructure**: Docker containerization on VPS
- **Monitoring**: Health checks and automated container management

### Manual Deployment

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t chopchop:latest .

# Run container
docker run -p 3000:3000 chopchop:latest
```

### CI/CD with GitHub Actions

**✅ Automated deployment on push to `main` branch**
- Pre-builds Next.js application outside Docker (secure)
- Packages into optimized container
- Deploys to VPS with environment variables
- Health checks and rollback capability

## API Integration

**✅ End-to-End Order Flow Working**

ChopChop integrates with:

- **MenuVerse Platform**: Real-time order synchronization to vendor dashboard
- **Firebase Firestore**: Real-time database for order management
- **Authentication Service**: Firebase Auth for user management
- **Location Services**: Google Maps for delivery tracking
- **Payment Gateway**: Stripe for secure payments

### Order Flow Architecture
```
Customer Order → ChopChop App → Firebase Firestore → MenuVerse Dashboard
                      ↓
               Real-time Updates
```

## 🗺️ **Development Roadmap**

See [`ROADMAP.md`](../ROADMAP.md) for detailed development plans including:

- **Phase 2 Features**: Order tracking, payment integrations, dispatch app
- **Safe Rollout Process**: Git workflow and testing guidelines
- **Timeline**: Implementation schedule and priorities
- **Quality Assurance**: Testing and deployment standards

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@chopchop.com or join our Discord server.

---

Made with ❤️ by the ChopChop Team