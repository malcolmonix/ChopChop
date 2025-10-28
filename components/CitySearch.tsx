import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';

export type ServiceLocation = {
  id: string | number;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
};

type Suggestion = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

const GET_AVAILABLE_LOCATIONS = gql`
  query AvailableLocations {
    availableLocations {
      id
      state
      city
      latitude
      longitude
      isAvailable
    }
  }
`;

export const USER_CURRENT_LOCATION_LS_KEY = 'USER_CURRENT_LOCATION_LS_KEY';

export type CitySearchProps = {
  onLocationSelect?: (loc: { id: string; label: string; latitude: number; longitude: number }) => void;
};

export default function CitySearch(props: CitySearchProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { onLocationSelect } = props;

  const [search, setSearch] = React.useState('');
  const [locations, setLocations] = React.useState<ServiceLocation[]>([]);
  const [filtered, setFiltered] = React.useState<Suggestion[]>([]);

  React.useEffect(() => {
    let mounted = true;
    client
      .query<{ availableLocations: ServiceLocation[] }>({ query: GET_AVAILABLE_LOCATIONS, fetchPolicy: 'cache-first' })
      .then((res) => {
        if (!mounted) return;
        setLocations(res.data?.availableLocations ?? []);
      })
      .catch(() => {
        // swallow for now; UI will just show no suggestions
      });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }
    const items: Suggestion[] = locations
      .filter((l) => l.isAvailable)
      .filter((l) => {
        const label = `${l.city}, ${l.state}`.toLowerCase();
        return label.includes(q) || l.city.toLowerCase().includes(q) || l.state.toLowerCase().includes(q);
      })
      .map((l) => ({
        id: String(l.id),
        label: `${l.city}, ${l.state}`,
        latitude: l.latitude,
        longitude: l.longitude,
      }));
    setFiltered(items);
  }, [search, locations]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFiltered([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: Suggestion) => {
    const { label, latitude, longitude, id } = item;
    try {
      localStorage.setItem(
        USER_CURRENT_LOCATION_LS_KEY,
        JSON.stringify({
          label,
          location: { coordinates: [longitude, latitude] as [number, number] },
          _id: id,
          deliveryAddress: label,
        })
      );
    } catch {}
    setSearch('');
    setFiltered([]);
    onLocationSelect?.({ id, label, latitude, longitude });
  };

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 560, margin: '0 auto 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: 12, borderRadius: 999, border: '2px solid transparent' }}>
        <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>📍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none' }}
        />
      </div>
      {filtered.length > 0 && (
        <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          {filtered.map((s) => (
            <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', cursor: 'pointer' }} onClick={() => handleSelect(s)}>
              <span aria-hidden="true" style={{ fontSize: '1rem', background: '#ededee', padding: 6, borderRadius: '999px' }}>📍</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
