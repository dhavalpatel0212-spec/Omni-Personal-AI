import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { AirportAutocomplete } from './AirportAutocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Calendar } from './Calendar';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { Plane, Hotel, Package, CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchFlights, useSearchHotels, useSearchPackages } from '../helpers/useTravel';
import { SearchResultCard } from './SearchResultCard';
import styles from './TravelSearchSection.module.css';

type SearchType = 'flights' | 'hotels' | 'packages';

interface TravelSearchSectionProps {
  defaultSearchType?: SearchType;
  defaultDestination?: string;
  prePopulatedData?: {
    destination?: string;
    budget?: number;
    travelers?: number;
    targetDate?: Date;
  } | null;
  onSearchComplete?: () => void;
}

export const TravelSearchSection: React.FC<TravelSearchSectionProps> = ({
  defaultSearchType = 'flights',
  defaultDestination = '',
  prePopulatedData = null,
  onSearchComplete,
}) => {
  const [activeSearch, setActiveSearch] = useState<SearchType>(defaultSearchType);
  const [expandedSection, setExpandedSection] = useState<SearchType | null>(defaultSearchType);

  // Search states
  const [flightSearch, setFlightSearch] = useState({
    from: '',
    to: prePopulatedData?.destination || defaultDestination,
    departDate: prePopulatedData?.targetDate || new Date(),
    returnDate: new Date((prePopulatedData?.targetDate?.getTime() || Date.now()) + 7 * 24 * 60 * 60 * 1000),
    travelers: prePopulatedData?.travelers || 2,
    tripType: 'return' as 'one-way' | 'return',
  });

  const [hotelSearch, setHotelSearch] = useState({
    destination: prePopulatedData?.destination || defaultDestination,
    checkIn: prePopulatedData?.targetDate || new Date(),
    checkOut: new Date((prePopulatedData?.targetDate?.getTime() || Date.now()) + 3 * 24 * 60 * 60 * 1000),
    travelers: prePopulatedData?.travelers || 2,
  });

  const [packageSearch, setPackageSearch] = useState({
    destination: prePopulatedData?.destination || defaultDestination,
    departDate: prePopulatedData?.targetDate || new Date(),
    returnDate: new Date((prePopulatedData?.targetDate?.getTime() || Date.now()) + 7 * 24 * 60 * 60 * 1000),
    travelers: prePopulatedData?.travelers || 2,
    budget: prePopulatedData?.budget || 2000,
  });

  const searchFlightsMutation = useSearchFlights();
  const searchHotelsMutation = useSearchHotels();
  const searchPackagesMutation = useSearchPackages();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleFlightSearch = () => {
    searchFlightsMutation.mutate(flightSearch, {
      onSuccess: () => onSearchComplete?.(),
    });
  };

  const handleHotelSearch = () => {
    searchHotelsMutation.mutate(hotelSearch, {
      onSuccess: () => onSearchComplete?.(),
    });
  };

  const handlePackageSearch = () => {
    searchPackagesMutation.mutate(packageSearch, {
      onSuccess: () => onSearchComplete?.(),
    });
  };

  // Auto-trigger package search when coming from "Find Deals"
  React.useEffect(() => {
    if (defaultSearchType === 'packages' && prePopulatedData && expandedSection === 'packages') {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        handlePackageSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [defaultSearchType, prePopulatedData, expandedSection]);

  const toggleSection = (section: SearchType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderFlightSearch = () => (
    <div className={styles.searchContent}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>From</label>
          <AirportAutocomplete
            placeholder="Departure airport"
            value={flightSearch.from}
            onChange={(value) => setFlightSearch(prev => ({ ...prev, from: value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>To</label>
          <AirportAutocomplete
            placeholder="Destination airport"
            value={flightSearch.to}
            onChange={(value) => setFlightSearch(prev => ({ ...prev, to: value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Departure</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={styles.dateButton}>
                <CalendarIcon size={16} />
                {formatDate(flightSearch.departDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={flightSearch.departDate}
                onSelect={(date) => date && setFlightSearch(prev => ({ ...prev, departDate: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        {flightSearch.tripType === 'return' && (
          <div className={styles.formGroup}>
            <label>Return</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={styles.dateButton}>
                  <CalendarIcon size={16} />
                  {formatDate(flightSearch.returnDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Calendar
                  mode="single"
                  selected={flightSearch.returnDate}
                  onSelect={(date) => date && setFlightSearch(prev => ({ ...prev, returnDate: date }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Travelers</label>
          <Input
            type="number"
            min="1"
            value={flightSearch.travelers}
            onChange={(e) => setFlightSearch(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Trip Type</label>
          <Select
            value={flightSearch.tripType}
            onValueChange={(value) => setFlightSearch(prev => ({ ...prev, tripType: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-way">One Way</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button 
        onClick={handleFlightSearch} 
        disabled={searchFlightsMutation.isPending}
        className={styles.searchButton}
      >
        {searchFlightsMutation.isPending ? 'Searching...' : 'Search Flights'}
      </Button>
    </div>
  );

  const renderHotelSearch = () => (
    <div className={styles.searchContent}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Destination</label>
          <Input
            placeholder="City or hotel name"
            value={hotelSearch.destination}
            onChange={(e) => setHotelSearch(prev => ({ ...prev, destination: e.target.value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Check-in</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={styles.dateButton}>
                <CalendarIcon size={16} />
                {formatDate(hotelSearch.checkIn)}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={hotelSearch.checkIn}
                onSelect={(date) => date && setHotelSearch(prev => ({ ...prev, checkIn: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className={styles.formGroup}>
          <label>Check-out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={styles.dateButton}>
                <CalendarIcon size={16} />
                {formatDate(hotelSearch.checkOut)}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={hotelSearch.checkOut}
                onSelect={(date) => date && setHotelSearch(prev => ({ ...prev, checkOut: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className={styles.formGroup}>
          <label>Travelers</label>
          <Input
            type="number"
            min="1"
            value={hotelSearch.travelers}
            onChange={(e) => setHotelSearch(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>
      <Button 
        onClick={handleHotelSearch} 
        disabled={searchHotelsMutation.isPending}
        className={styles.searchButton}
      >
        {searchHotelsMutation.isPending ? 'Searching...' : 'Search Hotels'}
      </Button>
    </div>
  );

  const renderPackageSearch = () => (
    <div className={styles.searchContent}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Destination</label>
          <Input
            placeholder="Where do you want to go?"
            value={packageSearch.destination}
            onChange={(e) => setPackageSearch(prev => ({ ...prev, destination: e.target.value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Departure</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={styles.dateButton}>
                <CalendarIcon size={16} />
                {formatDate(packageSearch.departDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={packageSearch.departDate}
                onSelect={(date) => date && setPackageSearch(prev => ({ ...prev, departDate: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className={styles.formGroup}>
          <label>Return</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={styles.dateButton}>
                <CalendarIcon size={16} />
                {formatDate(packageSearch.returnDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={packageSearch.returnDate}
                onSelect={(date) => date && setPackageSearch(prev => ({ ...prev, returnDate: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className={styles.formGroup}>
          <label>Travelers</label>
          <Input
            type="number"
            min="1"
            value={packageSearch.travelers}
            onChange={(e) => setPackageSearch(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Budget (£)</label>
          <Input
            type="number"
            min="1"
            value={packageSearch.budget}
            onChange={(e) => setPackageSearch(prev => ({ ...prev, budget: parseInt(e.target.value) || 1000 }))}
          />
        </div>
      </div>
      <Button 
        onClick={handlePackageSearch} 
        disabled={searchPackagesMutation.isPending}
        className={styles.searchButton}
      >
        {searchPackagesMutation.isPending ? 'Searching...' : 'Search Packages'}
      </Button>
    </div>
  );

  const renderResults = () => {
    const flightResults = searchFlightsMutation.data || [];
    const hotelResults = searchHotelsMutation.data || [];
    const packageResults = searchPackagesMutation.data || [];

    if (flightResults.length === 0 && hotelResults.length === 0 && packageResults.length === 0) {
      return null;
    }

    return (
      <div className={styles.resultsSection}>
        <h3 className={styles.resultsTitle}>Search Results</h3>
        <div className={styles.resultsGrid}>
          {flightResults.map((flight) => (
            <SearchResultCard key={flight.id} result={flight} type="flight" />
          ))}
          {hotelResults.map((hotel) => (
            <SearchResultCard key={hotel.id} result={hotel} type="hotel" />
          ))}
          {packageResults.map((pkg) => (
            <SearchResultCard key={pkg.id} result={pkg} type="package" />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchTabs}>
        {[
          { type: 'flights' as const, icon: Plane, label: 'Flights' },
          { type: 'hotels' as const, icon: Hotel, label: 'Hotels' },
          { type: 'packages' as const, icon: Package, label: 'Packages' },
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            className={`${styles.searchTab} ${expandedSection === type ? styles.active : ''}`}
            onClick={() => toggleSection(type)}
          >
            <Icon size={20} />
            <span>{label}</span>
            {expandedSection === type ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        ))}
      </div>

      {expandedSection === 'flights' && renderFlightSearch()}
      {expandedSection === 'hotels' && renderHotelSearch()}
      {expandedSection === 'packages' && renderPackageSearch()}

      {renderResults()}
    </div>
  );
};