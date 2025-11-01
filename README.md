# ChopChop - Fast Food Delivery App

🍕 **ChopChop** is a modern, fast food delivery application built with Next.js and TypeScript.

## Features

- 🏪 Browse restaurants and menus
- 🛒 Shopping cart and checkout
- 📱 Mobile-responsive design
- 💳 Secure payment processing
- 📍 Location-based restaurant discovery
- ⭐ Reviews and ratings
- 🚚 Real-time order tracking

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **API**: GraphQL (Apollo Client)
- **Payment**: Stripe
- **Maps**: Google Maps API
- **Authentication**: Firebase Auth

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

### Manual Deployment

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose up -d
```

### CI/CD with GitHub Actions

Automatic deployment on push to `main` branch.

## API Integration

ChopChop integrates with:

- **Food Delivery API**: GraphQL endpoint for orders, restaurants, menus
- **MenuVerse Platform**: Restaurant management integration
- **Payment Gateway**: Stripe for secure payments
- **Authentication Service**: Firebase Auth
- **Location Services**: Google Maps for delivery tracking

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