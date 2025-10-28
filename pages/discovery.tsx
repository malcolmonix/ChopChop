import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import RestaurantCard from '../components/RestaurantCard';

const NEAR_BY_RESTAURANTS_PREVIEW = gql`
  fragment RestaurantPreviewFields on RestaurantPreview {
    _id
    name
    image
    logo
    slug
    shopType
    deliveryTime
    location { coordinates }
    reviewAverage
    cuisines
    isAvailable
    isActive
  }
  query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String) {
    nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit, shopType: $shopType) {
      restaurants { ...RestaurantPreviewFields }
    }
  }
`;

const USER_CURRENT_LOCATION_LS_KEY = 'USER_CURRENT_LOCATION_LS_KEY';
const DEFAULT_LATITUDE = 5.0333; // Uyo fallback
const DEFAULT_LONGITUDE = 7.9333;

type RestaurantPreview = {
  _id: string;
  name: string;
  cuisines?: string[];
  deliveryTime?: number;
  image?: string;
  logo?: string;
};

export default function DiscoveryPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [restaurants, setRestaurants] = React.useState<RestaurantPreview[]>([]);
  const [where, setWhere] = React.useState<{lat: number; lng: number}>({ lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE });

  React.useEffect(() => {
    let mounted = true;
    // Read location from localStorage
    try {
      const raw = localStorage.getItem(USER_CURRENT_LOCATION_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const coords = parsed?.location?.coordinates as [number, number] | undefined;
        if (coords && coords.length === 2) {
          setWhere({ lat: coords[1], lng: coords[0] });
        }
      }
    } catch {}

    const run = async () => {
      try {
        const res = await client.query<{ nearByRestaurantsPreview?: { restaurants?: RestaurantPreview[] } }>({
          query: NEAR_BY_RESTAURANTS_PREVIEW,
          variables: {
            latitude: where.lat ?? DEFAULT_LATITUDE,
            longitude: where.lng ?? DEFAULT_LONGITUDE,
            page: 1,
            limit: 24,
          },
          fetchPolicy: 'network-only',
        });
        if (!mounted) return;
        const list = res?.data?.nearByRestaurantsPreview?.restaurants ?? [];
        setRestaurants(list);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(e as Error);
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [where.lat, where.lng]);

  if (loading) return <div style={{ padding: 24 }}>Loading nearby restaurants…</div>;
  if (error) return <div style={{ padding: 24 }}>Error: {error.message}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Restaurants near you</h1>
      {restaurants.length === 0 ? (
        <div>No restaurants found for the selected location.</div>
      ) : (
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {restaurants.map((r) => (
            <li key={r._id} style={{ listStyle: 'none' }}>
              <RestaurantCard
                id={r._id}
                name={r.name}
                image={r.image}
                logo={r.logo}
                cuisines={r.cuisines}
                deliveryTime={r.deliveryTime}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
