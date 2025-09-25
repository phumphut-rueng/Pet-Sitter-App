import { useState, useEffect, useCallback } from 'react';
import { Sitter } from '@/types/sitter.types';
import axios from 'axios';
import { useRouter } from 'next/router';

interface SearchFilters {
  searchTerm: string;
  petTypes: string[];
  rating: number;
  experience: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export function usePetSitterData() {
  const router = useRouter();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    petTypes: [],
    rating: 0,
    experience: "all"
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0
  });

  const cardsPerPage = 5;

  // Parse initial filters from URL parameters
  const getInitialFilters = useCallback((): SearchFilters => {
    if (!router.isReady) {
      return {
        searchTerm: "",
        petTypes: [],
        rating: 0,
        experience: "all"
      };
    }

    const { query } = router;
    return {
      searchTerm: (query.searchTerm as string) || "",
      petTypes: query.petTypes ? (query.petTypes as string).split(',') : [],
      rating: query.rating ? parseInt(query.rating as string, 10) : 0,
      experience: (query.experience as string) || "all"
    };
  }, [router]);

  // Update filters when router is ready and URL parameters change
  useEffect(() => {
    if (router.isReady) {
      const newFilters = getInitialFilters();
      setFilters(newFilters);
    }
  }, [router.isReady, router.query, getInitialFilters]);

  const fetchSitters = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: cardsPerPage.toString()
      });

      if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
      }
      if (filters.petTypes.length > 0) {
        filters.petTypes.forEach(type => params.append('petTypes', type));
      }
      if (filters.rating > 0) {
        params.append('rating', filters.rating.toString());
      }
      if (filters.experience !== "all") {
        params.append('experience', filters.experience);
      }

      const response = await axios.get(`/api/sitter/get-sitter?${params.toString()}`);
      
      if (response.data.data) {
        setSitters(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setSitters(response.data);
        setPagination({
          page: 1,
          limit: response.data.length,
          totalCount: response.data.length,
          totalPages: 1
        });
      }
    } catch (error: any) {
      console.error("Error fetching sitters:", error);
      
      // Handle different error types gracefully
      if (error.response?.status === 404) {
        // No results found - this is normal, not an error
        setSitters([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      } else if (error.response?.status === 500) {
        // Server error
        console.error("Server error:", error.response.data);
        setSitters([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      } else {
        // Network or other errors
        console.error("Network error:", error.message);
        setSitters([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, cardsPerPage]);

  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters({
      searchTerm: "",
      petTypes: [],
      rating: 0,
      experience: "all"
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    sitters,
    loading,
    currentPage,
    filters,
    pagination,
    handleSearch,
    handleClear,
    handlePageChange
  };
}
