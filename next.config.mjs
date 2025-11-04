/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Use an alternate dist dir in development to avoid Windows file lock issues on .next
  ...(process.env.NODE_ENV === 'development' ? { distDir: '.next_dev' } : {}),
  // Disable output file tracing to avoid creating the locked 'trace' file on some Windows setups
  outputFileTracing: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
