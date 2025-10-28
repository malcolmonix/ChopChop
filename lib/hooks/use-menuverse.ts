import { useState, useEffect, useCallback } from 'react';
import { menuverseService, Eatery, MenuItem } from '../services/menuverse';

// Hook for fetching all eateries
export function useEateries(limit?: number) {
  const [eateries, setEateries] = useState<Eatery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEateries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuverseService.getAllEateries(limit);
      setEateries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch eateries');
      console.error('Error in useEateries:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchEateries();
  }, [fetchEateries]);

  return { eateries, loading, error, refetch: fetchEateries };
}

// Hook for fetching a single eatery
export function useEatery(eateryId: string | null) {
  const [eatery, setEatery] = useState<Eatery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEatery = useCallback(async () => {
    if (!eateryId) {
      setEatery(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await menuverseService.getEateryProfile(eateryId);
      setEatery(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch eatery');
      console.error('Error in useEatery:', err);
    } finally {
      setLoading(false);
    }
  }, [eateryId]);

  useEffect(() => {
    fetchEatery();
  }, [fetchEatery]);

  return { eatery, loading, error, refetch: fetchEatery };
}

// Hook for fetching menu items
export function useMenuItems(eateryId: string | null) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    if (!eateryId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await menuverseService.getMenuItems(eateryId);
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      console.error('Error in useMenuItems:', err);
    } finally {
      setLoading(false);
    }
  }, [eateryId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return { menuItems, loading, error, refetch: fetchMenuItems };
}

// Hook for searching eateries
export function useEaterySearch() {
  const [results, setResults] = useState<Eatery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchTerm: string, limit?: number) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await menuverseService.searchEateries(searchTerm, limit);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error in useEaterySearch:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearResults };
}

// Hook for placing orders
export function useOrderPlacement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const placeOrder = async (eateryId: string, orderData: any) => {
    try {
      setLoading(true);
      setError(null);
      setOrderId(null);
      
      const id = await menuverseService.placeOrder(eateryId, orderData);
      setOrderId(id);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      console.error('Error in useOrderPlacement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetOrder = () => {
    setOrderId(null);
    setError(null);
  };

  return { placeOrder, loading, error, orderId, resetOrder };
}