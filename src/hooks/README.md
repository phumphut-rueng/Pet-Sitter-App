# Search Filter Hooks

## useSearchFilter

Custom hook สำหรับจัดการ search filter state และ logic

### Features
- ✅ State management สำหรับ search filters
- ✅ Type-safe ด้วย TypeScript
- ✅ Reusable across components
- ✅ Callback support สำหรับ onSearch และ onClear
- ✅ Initial filters support

### Usage

#### Basic Usage
```tsx
import { useSearchFilter } from '@/hooks/useSearchFilter';

function MyComponent() {
  const {
    searchTerm,
    selectedPetTypes,
    rating,
    selectedExperience,
    handleSearch,
    handleClear,
    handlePetTypeChange,
    handleRatingChange,
  } = useSearchFilter({
    onSearch: (filters) => {
      console.log('Searching:', filters);
    },
    onClear: () => {
      console.log('Cleared');
    },
  });

  return (
    // Your custom UI here
  );
}
```

#### With SearchFilter Component
```tsx
import SearchFilter from '@/components/findpetsitter/SearchFilter';

function MyPage() {
  const handleSearch = (filters) => {
    // API call logic
  };

  const handleClear = () => {
    // Reset logic
  };

  return (
    <SearchFilter 
      onSearch={handleSearch} 
      onClear={handleClear}
      initialFilters={{ petTypes: ['Dog'], rating: 4 }}
    />
  );
}
```

### API Reference

#### SearchFilters Interface
```typescript
interface SearchFilters {
  searchTerm: string;
  petTypes: string[];
  rating: number;
  experience: string;
}
```

#### Hook Options
```typescript
interface UseSearchFilterOptions {
  onSearch?: (filters: SearchFilters) => void;
  onClear?: () => void;
  initialFilters?: Partial<SearchFilters>;
}
```

#### Return Values
- **State**: `searchTerm`, `selectedPetTypes`, `rating`, `selectedExperience`, `filters`
- **Setters**: `setSearchTerm`, `setSelectedPetTypes`, `setRating`, `setSelectedExperience`
- **Handlers**: `handleSearch`, `handleClear`, `handlePetTypeChange`, `handleRatingChange`

## useAdvancedSearchFilter

Extended version ของ useSearchFilter ที่มี features เพิ่มเติม

### Additional Features
- Price range filtering
- Availability filtering
- Sort options
- Active filters detection

### Usage
```tsx
import { useAdvancedSearchFilter } from '@/hooks/useAdvancedSearchFilter';

function AdvancedSearchPage() {
  const {
    // Basic search properties
    searchTerm,
    selectedPetTypes,
    rating,
    selectedExperience,
    
    // Advanced properties
    priceRange,
    availability,
    sortBy,
    sortOrder,
    
    // Handlers
    handleSearch,
    handleClear,
    handlePriceRangeChange,
    handleAvailabilityChange,
    handleSortChange,
    
    // Computed values
    hasActiveFilters,
  } = useAdvancedSearchFilter({
    onSearch: (filters) => {
      console.log('Advanced search:', filters);
    },
  });

  return (
    // Your advanced UI here
  );
}
```

## Best Practices

### 1. Component vs Hook Usage
- **ใช้ Component** เมื่อต้องการ UI ที่เหมือนกันทุกที่
- **ใช้ Hook** เมื่อต้องการ custom UI หรือ logic ที่แตกต่างกัน

### 2. State Management
- Hook จัดการ state ภายใน
- Parent component รับ callback เพื่อจัดการ side effects
- ใช้ `initialFilters` สำหรับ pre-populate values

### 3. Performance
- Hook ใช้ `useCallback` เพื่อป้องกัน unnecessary re-renders
- ใช้ `useMemo` สำหรับ computed values
- แยก logic ออกจาก UI components

### 4. Testing
- Test hook logic แยกจาก UI
- Mock callbacks ใน tests
- Test different initial states

## Migration Guide

### จาก Component State ไป Custom Hook

**Before:**
```tsx
function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [petTypes, setPetTypes] = useState([]);
  // ... more state

  const handleSearch = () => {
    // search logic
  };

  const handleClear = () => {
    // clear logic
  };

  return (
    // UI
  );
}
```

**After:**
```tsx
function MyComponent() {
  const {
    searchTerm,
    selectedPetTypes,
    handleSearch,
    handleClear,
    // ... other properties
  } = useSearchFilter({
    onSearch: (filters) => {
      // search logic
    },
    onClear: () => {
      // clear logic
    },
  });

  return (
    // UI
  );
}
```
