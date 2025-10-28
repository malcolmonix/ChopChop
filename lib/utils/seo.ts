import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const defaultMeta = {
  title: 'Enatega - Food Delivery Multi-Vendor Platform',
  description: 'Order delicious food from your favorite restaurants with Enatega. Fast delivery, multiple cuisines, and great deals.',
  keywords: ['food delivery', 'restaurant', 'order food online', 'food ordering', 'delivery service'],
  image: '/og-image.jpg',
  url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000',
};

export function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
}: SEOProps = {}): Metadata {
  const metaTitle = title ? `${title} | Enatega` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaKeywords = keywords || defaultMeta.keywords;
  const metaImage = image || defaultMeta.image;
  const metaUrl = url || defaultMeta.url;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords.join(', '),
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type,
      title: metaTitle,
      description: metaDescription,
      url: metaUrl,
      siteName: 'Enatega',
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    alternates: {
      canonical: metaUrl,
    },
  };
}

// Helper for JSON-LD structured data
export function generateRestaurantSchema(restaurant: {
  name: string;
  description: string;
  address: string;
  phone?: string;
  rating?: number;
  priceRange?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
    },
    telephone: restaurant.phone,
    aggregateRating: restaurant.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: restaurant.rating,
          bestRating: '5',
        }
      : undefined,
    priceRange: restaurant.priceRange || '$$',
    image: restaurant.image,
  };
}
