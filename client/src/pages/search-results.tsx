import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import FloristCard from "@/components/florist-card";
import SearchFilters from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, Map, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchResults() {
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const [searchParams, setSearchParams] = useState({
    keyword: urlParams.get('keyword') || '',
    location: urlParams.get('location') || '',
    services: urlParams.get('services')?.split(',').filter(Boolean) || [],
    sortBy: (urlParams.get('sortBy') as 'distance' | 'rating' | 'newest') || 'distance',
    limit: 12,
    offset: 0,
  });

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/florists/search', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/florists/search?${params}`);
      if (!response.ok) throw new Error('Failed to search florists');
      return response.json();
    },
  });

  const handleSearch = (newKeyword: string, newLocation: string) => {
    setSearchParams(prev => ({
      ...prev,
      keyword: newKeyword,
      location: newLocation,
      offset: 0,
    }));
  };

  const handleFilterChange = (filters: any) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      offset: 0,
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: sortBy as 'distance' | 'rating' | 'newest',
      offset: 0,
    }));
  };

  const clearFilters = () => {
    setSearchParams(prev => ({
      ...prev,
      services: [],
      offset: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Florist Results
                {searchParams.location && (
                  <span className="text-gray-600"> - {searchParams.location}</span>
                )}
              </h1>
              <p className="text-gray-600">
                {searchResults ? (
                  `Showing ${searchResults.florists.length} of ${searchResults.total} results`
                ) : (
                  'Searching...'
                )}
              </p>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={searchParams.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Closest to Me</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center bg-card rounded-lg p-1 shadow-sm border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2",
                    viewMode === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2",
                    viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "p-2",
                    viewMode === 'map' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="What do you need?"
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchParams.keyword, searchParams.location);
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="City, state, or ZIP code"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchParams.keyword, searchParams.location);
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => handleSearch(searchParams.keyword, searchParams.location)}
                className="btn-primary px-6"
              >
                Search
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Active Filters */}
          {searchParams.services.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchParams.services.map((service) => (
                <span
                  key={service}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {service}
                  <button
                    onClick={() => {
                      setSearchParams(prev => ({
                        ...prev,
                        services: prev.services.filter(s => s !== service),
                      }));
                    }}
                    className="hover:text-primary-dark"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {searchParams.services.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-primary text-sm hover:text-primary-dark"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <SearchFilters
                onFilterChange={handleFilterChange}
                currentFilters={{
                  services: searchParams.services,
                }}
              />
            </div>
          )}
          
          {/* Results */}
          <div className={cn(
            showFilters ? "lg:col-span-3" : "lg:col-span-4"
          )}>
            {isLoading ? (
              <div className="grid gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-64 h-48 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-4">
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Failed to search florists. Please try again.</p>
                <Button
                  onClick={() => handleSearch(searchParams.keyword, searchParams.location)}
                  className="btn-primary"
                >
                  Retry Search
                </Button>
              </div>
            ) : searchResults?.florists.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No florists found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or expanding your search area.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
                  viewMode === 'list' && "grid-cols-1"
                )}>
                  {searchResults?.florists.map((florist) => (
                    <FloristCard
                      key={florist.id}
                      florist={florist}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {searchResults && searchResults.total > searchParams.limit && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={searchParams.offset === 0}
                        onClick={() => setSearchParams(prev => ({
                          ...prev,
                          offset: Math.max(0, prev.offset - prev.limit)
                        }))}
                      >
                        Previous
                      </Button>
                      
                      <span className="px-4 py-2 text-sm text-muted-foreground">
                        Page {Math.floor(searchParams.offset / searchParams.limit) + 1} of{' '}
                        {Math.ceil(searchResults.total / searchParams.limit)}
                      </span>
                      
                      <Button
                        variant="outline"
                        disabled={searchParams.offset + searchParams.limit >= searchResults.total}
                        onClick={() => setSearchParams(prev => ({
                          ...prev,
                          offset: prev.offset + prev.limit
                        }))}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
