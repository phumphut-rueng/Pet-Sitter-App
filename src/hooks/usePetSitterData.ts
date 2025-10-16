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

export function usePetSitterData(initialFilters?: SearchFilters) {
  const router = useRouter();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  // Parse initial filters from URL parameters หรือ initialFilters
  const getInitialFilters = useCallback((): SearchFilters => {
    // ถ้ามี initialFilters (จาก stored filters) ให้ใช้แทน
    if (initialFilters) {
      return initialFilters;
    }

    // ถ้าไม่มี initialFilters ให้ใช้ URL parameters
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
  }, [router, initialFilters]);

  // สร้าง fetch function เดียวสำหรับทุกการใช้งาน
  const fetchSitters = useCallback(async (filtersToUse: SearchFilters) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: cardsPerPage.toString()
      });

      if (filtersToUse.searchTerm) {
        params.append('searchTerm', filtersToUse.searchTerm);
      }
      if (filtersToUse.petTypes.length > 0) {
        filtersToUse.petTypes.forEach(type => params.append('petTypes', type));
      }
      if (filtersToUse.rating > 0) {
        params.append('rating', filtersToUse.rating.toString());
      }
      if (filtersToUse.experience !== "all") {
        params.append('experience', filtersToUse.experience);
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
    } catch (error: unknown) {
      console.error("Error fetching sitters:", error);
      
      // Handle different error types gracefully
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: unknown } };
        if (axiosError.response?.status === 404) {
          // No results found - this is normal, not an error
          setSitters([]);
          setPagination({
            page: 1,
            limit: cardsPerPage,
            totalCount: 0,
            totalPages: 0
          });
        } else if (axiosError.response?.status === 500) {
          // Server error
          console.error("Server error:", axiosError.response.data);
          setSitters([]);
          setPagination({
            page: 1,
            limit: cardsPerPage,
            totalCount: 0,
            totalPages: 0
          });
        } else {
          // Network or other errors
          setSitters([]);
          setPagination({
            page: 1,
            limit: cardsPerPage,
            totalCount: 0,
            totalPages: 0
          });
        }
      } else {
        // Network or other errors
        console.error("Network error:", error);
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
  }, [currentPage, cardsPerPage]);

  // Initialize filters เมื่อเข้าหน้าแรก
  useEffect(() => {
    if (!router.isReady || !isInitialLoad) return;
    
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    fetchSitters(newFilters);
    setIsInitialLoad(false); // ป้องกันการ fetch ซ้ำ
    
    // ล้าง URL parameters หลังจากใช้แล้ว
    if (Object.keys(router.query).length > 0) {
      router.replace('/findpetsitter', undefined, { shallow: true });
    }
    
    // Scroll to top เมื่อเข้าหน้าแรก (บนสุดของเว็บไซต์)
    
  }, [router.isReady, getInitialFilters, fetchSitters, isInitialLoad, router]);

  // Fetch data เมื่อ filters หรือ pagination เปลี่ยน (เฉพาะเมื่อไม่ใช่ initial load)
  useEffect(() => {
    if (!router.isReady || isInitialLoad) return;
    
    fetchSitters(filters);
    
    // Scroll to top เมื่อ filters หรือ pagination เปลี่ยน (บนสุดของเว็บไซต์)
    
  }, [filters, currentPage, router.isReady, fetchSitters, isInitialLoad]);

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Scroll to top เมื่อ search (ใช้วิธีที่แน่นอนกว่า)
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    setFilters({
      searchTerm: "",
      petTypes: [],
      rating: 0,
      experience: "all"
    });
    setCurrentPage(1);
    
    // Scroll to top เมื่อ clear (ใช้วิธีที่แน่นอนกว่า)
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Scroll to top เมื่อเปลี่ยนหน้า (ใช้วิธีที่แน่นอนกว่า)
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
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
