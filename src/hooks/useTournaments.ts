'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Tournament } from '@/types';

export type TournamentsFilters = {
  filterMain?: string;
  filterSub?: string;
  selectedLocations?: string[];
  searchTerm?: string;
};

const DEFAULT_FILTER_MAIN = '카테고리 선택';

export function useTournaments(filters?: TournamentsFilters) {
  const [data, setData] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      const filterMain = filters?.filterMain ?? DEFAULT_FILTER_MAIN;
      const filterSub = filters?.filterSub ?? '';
      const selectedLocations = filters?.selectedLocations ?? [];
      const searchTerm = filters?.searchTerm ?? '';

      if (filterSub) {
        query = query.ilike('level', `%${filterSub}%`);
      } else if (filterMain !== DEFAULT_FILTER_MAIN && filterMain !== '전체 보기') {
        const keyword = filterMain.replace(' 복식', '').replace('단식', '');
        query = query.ilike('level', `%${keyword}%`);
      }

      if (selectedLocations.length > 0) {
        const orQuery = selectedLocations.map((loc) => `location.ilike.%${loc}%`).join(',');
        query = query.or(orQuery);
      }

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,organizer.ilike.%${searchTerm}%`
        );
      }

      const { data: result, error: qError } = await query;
      if (qError) throw qError;
      setData((result as Tournament[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.filterMain,
    filters?.filterSub,
    filters?.selectedLocations?.join(','),
    filters?.searchTerm,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/** 홈/간단 목록용: 필터 없이 전체 조회 */
export function useTournamentsSimple() {
  const [data, setData] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: qError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (qError) throw qError;
      setData((result as Tournament[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
