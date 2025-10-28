import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import HeroBanner from '../components/HeroBanner';
import LocationPicker from '../components/LocationPicker';
import { USER_CURRENT_LOCATION_LS_KEY } from '../components/CitySearch';
import styles from '../styles/Home.module.css';
import gridStyles from '../styles/HomeGrid.module.css';
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
  query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String, $city: String, $state: String) {
    nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit, shopType: $shopType, city: $city, state: $state) {
      restaurants { ...RestaurantPreviewFields }
    }
  }
`;

// Backward-compatible query (for servers that don't accept city/state args)
const NEAR_BY_RESTAURANTS_PREVIEW_BASE = gql`
  fragment RestaurantPreviewFieldsBase on RestaurantPreview {
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
  query RestaurantsBase($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String) {
    nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit, shopType: $shopType) {
      restaurants { ...RestaurantPreviewFieldsBase }
    }
  }
`;

// Fallback for servers without nearByRestaurantsPreview at all
const RESTAURANTS_PAGINATED_FALLBACK = gql`
  query RestaurantsPaginatedFallback($page: Int, $limit: Int) {
    restaurantsPaginated(page: $page, limit: $limit) {
      data {
        _id
        name
        image
        logo
        isActive
      }
      totalPages
    }
  }
`;

export type RestaurantPreview = {
  _id: string;
  name: string;
  cuisines?: string[];
  image?: string | null;
  logo?: string | null;
  slug?: string;
  deliveryTime?: number | null;
  reviewAverage?: number | null;
  isAvailable?: boolean | null;
  isActive?: boolean | null;
};

const DEFAULT_LATITUDE = 5.0333; // Uyo
const DEFAULT_LONGITUDE = 7.9333;

export default function Home() {
  const [where, setWhere] = React.useState<{ lat: number; lng: number }>({ lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE });
  const [selectedCity, setSelectedCity] = React.useState<string | undefined>(undefined);
  const [selectedState, setSelectedState] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [restaurants, setRestaurants] = React.useState<RestaurantPreview[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 24;
  const [hasMore, setHasMore] = React.useState(true);

  const fetchRestaurants = React.useCallback(
    async (lat: number, lng: number, pageArg = 1, append = false, cityArg?: string, stateArg?: string) => {
      setError(null);
      try {
        const res = await client.query<{ nearByRestaurantsPreview?: { restaurants?: RestaurantPreview[] } }>(
          {
            query: NEAR_BY_RESTAURANTS_PREVIEW,
            variables: { latitude: lat, longitude: lng, page: pageArg, limit, city: cityArg, state: stateArg },
            fetchPolicy: 'network-only',
          }
        );
        const list = res?.data?.nearByRestaurantsPreview?.restaurants ?? [];
        setHasMore(list.length === limit);
        if (append) {
          setRestaurants((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...list.filter((n) => !ids.has(n._id))];
          });
        } else {
          setRestaurants(list);
        }
      } catch (e) {
        // Fallbacks for argument or field incompatibilities
        const err = e as any;
        const msg: string = err?.message || '';
        const networkStatus = err?.networkError?.statusCode || err?.statusCode;
        const graphQLErrors: Array<{ message?: string }> = err?.graphQLErrors || err?.networkError?.result?.errors || [];
        const messages = [msg, ...graphQLErrors.map((g) => g?.message || '')].join(' ');
        const isUnknownArg = /Unknown argument\s+\"(city|state)\"/i.test(messages);
        const isMissingField = /Cannot query field\s+\"nearByRestaurantsPreview\"/i.test(messages);
        const isGeneric400 = Number(networkStatus) === 400;

        if (isUnknownArg || isGeneric400) {
          try {
            const res2 = await client.query<{ nearByRestaurantsPreview?: { restaurants?: RestaurantPreview[] } }>(
              {
                query: NEAR_BY_RESTAURANTS_PREVIEW_BASE,
                variables: { latitude: lat, longitude: lng, page: pageArg, limit },
                fetchPolicy: 'network-only',
              }
            );
            const list2 = res2?.data?.nearByRestaurantsPreview?.restaurants ?? [];
            setHasMore(list2.length === limit);
            if (append) {
              setRestaurants((prev) => {
                const ids = new Set(prev.map((p) => p._id));
                return [...prev, ...list2.filter((n) => !ids.has(n._id))];
              });
            } else {
              setRestaurants(list2);
            }
            return;
          } catch (e2) {
            setError(e2 as Error);
          }
        } else if (isMissingField) {
          try {
            const res3 = await client.query<{ restaurantsPaginated?: { data?: RestaurantPreview[]; totalPages?: number } }>(
              {
                query: RESTAURANTS_PAGINATED_FALLBACK,
                variables: { page: pageArg, limit },
                fetchPolicy: 'network-only',
              }
            );
            const paged = res3?.data?.restaurantsPaginated;
            const list3 = paged?.data ?? [];
            setHasMore(list3.length === limit);
            if (append) {
              setRestaurants((prev) => {
                const ids = new Set(prev.map((p) => p._id));
                return [...prev, ...list3.filter((n) => !ids.has(n._id))];
              });
            } else {
              setRestaurants(list3);
            }
            return;
          } catch (e3) {
            setError(e3 as Error);
          }
        } else {
          setError(err as Error);
        }
      } finally {
        if (append) setLoadingMore(false); else setLoading(false);
      }
    },
    [limit]
  );

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_CURRENT_LOCATION_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const coords = parsed?.location?.coordinates as [number, number] | undefined;
        if (coords && coords.length === 2) {
          setWhere({ lat: coords[1], lng: coords[0] });
        }
        const label = parsed?.deliveryAddress || parsed?.label || '';
        if (label) {
          const parts = String(label).split(',').map((s) => s.trim());
          if (parts.length >= 2) {
            setSelectedCity(parts[0]);
            setSelectedState(parts.slice(1).join(', '));
          }
        }
      }
    } catch {}
  }, []);

  // Fetch whenever location or selected city/state changes
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchRestaurants(where.lat, where.lng, 1, false, selectedCity, selectedState);
  }, [where.lat, where.lng, selectedCity, selectedState, fetchRestaurants]);

  const handleLoadMore = React.useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchRestaurants(where.lat, where.lng, next, true, selectedCity, selectedState);
  }, [page, where.lat, where.lng, selectedCity, selectedState, fetchRestaurants]);

  const filtered = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const slug = (r.slug || '').toLowerCase();
      const meals = (r.cuisines || []).join(' ').toLowerCase();
      return name.includes(q) || slug.includes(q) || meals.includes(q);
    });
  }, [restaurants, searchText]);

  return (
    <div className={styles.homeContainer}>
      <div className={gridStyles.bannerWrap}>
        <HeroBanner />
        <div className={gridStyles.lpFloat}>
          <LocationPicker
            variant="compact"
            onLocationSelect={(s) => {
              const parts = String(s.label || '').split(',').map((p) => p.trim());
              const city = parts[0] || undefined;
              const state = parts.length >= 2 ? parts.slice(1).join(', ') : undefined;
              setWhere({ lat: s.latitude, lng: s.longitude });
              setSelectedCity(city);
              setSelectedState(state);
              setPage(1);
              setHasMore(true);
              fetchRestaurants(s.latitude, s.longitude, 1, false, city, state);
            }}
          />
        </div>
      </div>

      <div className={gridStyles.header}>
        <div className={gridStyles.searchWrapper}>
          <span className={gridStyles.searchIcon} aria-hidden>🔎</span>
          <input
            className={gridStyles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search vendors, branches, meals"
          />
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: '#ef4444' }}>Error: {error.message}</div>
      ) : filtered.length === 0 ? (
        <div>No restaurants found for the selected location.</div>
      ) : (
        <>
          <ul className={gridStyles.grid}>
            {filtered.map((r) => (
              <li key={r._id} style={{ listStyle: 'none' }}>
                <RestaurantCard
                  id={r._id}
                  name={r.name}
                  image={r.image}
                  logo={r.logo}
                  cuisines={r.cuisines}
                  reviewAverage={r.reviewAverage}
                  deliveryTime={r.deliveryTime}
                  isAvailable={r.isAvailable}
                  isActive={r.isActive}
                />
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className={gridStyles.loadMoreWrap}>
              <button className={gridStyles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
