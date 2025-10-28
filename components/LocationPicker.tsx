import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import styles from '../styles/LocationPicker.module.css';

type ServiceLocation = {
  id: string | number;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
};

type LocationPickerProps = {
  onLocationSelect?: (loc: { id: string; label: string; latitude: number; longitude: number }) => void;
  variant?: 'default' | 'compact';
  className?: string;
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

const USER_CURRENT_LOCATION_LS_KEY = 'USER_CURRENT_LOCATION_LS_KEY';

export default function LocationPicker({ onLocationSelect, variant = 'default', className }: LocationPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [locations, setLocations] = React.useState<ServiceLocation[]>([]);
  const [selectedLabel, setSelectedLabel] = React.useState<string>('');
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Load saved selection from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_CURRENT_LOCATION_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const label = parsed?.deliveryAddress || parsed?.label || '';
        if (label) setSelectedLabel(label);
      }
    } catch {}
  }, []);

  // Fetch available locations (prefer fresh data to avoid stale cache)
  const fetchLocations = React.useCallback(async () => {
    try {
      const res = await client.query<{ availableLocations: ServiceLocation[] }>({
        query: GET_AVAILABLE_LOCATIONS,
        fetchPolicy: 'network-only',
      });
      const list = res.data?.availableLocations ?? [];
      // sort by state -> city for consistent order
      list.sort((a, b) =>
        a.state.localeCompare(b.state) || a.city.localeCompare(b.city)
      );
      setLocations(list);
      if (typeof window !== 'undefined') {
        console.log('[LocationPicker] loaded locations:', list.map(l => `${l.city}, ${l.state}`));
      }
    } catch (err) {
      // Fallback to a small built-in list if backend doesn't support availableLocations (HTTP 400)
      const fallback: ServiceLocation[] = [
        { id: 'uyo', state: 'Akwa Ibom', city: 'Uyo', latitude: 5.0389, longitude: 7.9135, isAvailable: true },
        { id: 'calabar', state: 'Cross River', city: 'Calabar', latitude: 4.9589, longitude: 8.3269, isAvailable: true },
        { id: 'ikom', state: 'Cross River', city: 'Ikom', latitude: 5.9640, longitude: 8.7067, isAvailable: true },
      ];
      setLocations(fallback);
      if (typeof window !== 'undefined') {
        console.warn('[LocationPicker] falling back to built-in locations due to error:', err);
      }
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    fetchLocations();
    return () => {
      mounted = false;
    };
  }, [fetchLocations]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePick = (loc: ServiceLocation) => {
    const label = `${loc.city}, ${loc.state}`;
    try {
      localStorage.setItem(
        USER_CURRENT_LOCATION_LS_KEY,
        JSON.stringify({
          label,
          location: { coordinates: [loc.longitude, loc.latitude] as [number, number] },
          _id: String(loc.id),
          deliveryAddress: label,
        })
      );
    } catch {}
    setSelectedLabel(label);
    setOpen(false);
    onLocationSelect?.({ id: String(loc.id), label, latitude: loc.latitude, longitude: loc.longitude });
  };

  const isCompact = variant === 'compact';

  return (
    <div ref={containerRef} className={`${styles.container} ${isCompact ? styles.containerCompact : ''} ${className || ''}`}>
      <button
        type="button"
        onClick={() => {
          // ensure latest data when user opens the list
          if (!open) fetchLocations();
          setOpen((s) => !s);
        }}
        className={`${styles.button} ${isCompact ? styles.buttonCompact : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.buttonLabel}>
          <span className={`${styles.icon} ${isCompact ? styles.iconCompact : ''}`} aria-hidden="true">📍</span>
          <span>{selectedLabel || 'Choose location'}</span>
        </span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul role="listbox" className={styles.dropdown}>
          {locations
            .filter((l) => l.isAvailable)
            .filter((l, idx, arr) => {
              // de-duplicate by city/state in case seeds were applied multiple times
              const key = `${l.city}|${l.state}`.toLowerCase();
              const firstIdx = arr.findIndex((x) => `${x.city}|${x.state}`.toLowerCase() === key);
              return firstIdx === idx;
            })
            .map((l) => {
            const label = `${l.city}, ${l.state}`;
            const isSelected = label === selectedLabel;
            return (
              <li
                key={String(l.id)}
                role="option"
                aria-selected={isSelected}
                onClick={() => handlePick(l)}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
              >
                <span className={styles.icon} aria-hidden="true">📍</span>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
