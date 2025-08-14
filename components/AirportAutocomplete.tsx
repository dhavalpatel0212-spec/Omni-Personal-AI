import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { useAirportSearch, Airport } from '../helpers/AirportSearch';
import styles from './AirportAutocomplete.module.css';

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search airports...",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { query, setQuery, results } = useAirportSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setQuery(newValue);
    
    // Show dropdown if user has typed at least 2 characters
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleAirportSelect = (airport: Airport) => {
    const formattedValue = `${airport.code} - ${airport.name}, ${airport.city}`;
    setInputValue(formattedValue);
    onChange(formattedValue);
    setIsOpen(false);
    setQuery('');
  };

  const formatAirportDisplay = (airport: Airport): string => {
    return `${airport.code} - ${airport.name}, ${airport.city}`;
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={styles.input}
      />
      
      {isOpen && (
        <div className={styles.dropdown}>
          {results.length > 0 ? (
            <ul className={styles.resultsList}>
              {results.map((airport) => (
                <li
                  key={airport.code}
                  className={styles.resultItem}
                  onClick={() => handleAirportSelect(airport)}
                >
                  <div className={styles.airportCode}>{airport.code}</div>
                  <div className={styles.airportDetails}>
                    <div className={styles.airportName}>{airport.name}</div>
                    <div className={styles.airportLocation}>
                      {airport.city}, {airport.country}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className={styles.noResults}>
              No airports found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};