import { useState, useMemo } from 'react';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Comprehensive airport database covering major international hubs, popular destinations, and regional centers
const airports: Airport[] = [
  // Major US Hubs
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States' },
  { code: 'MDW', name: 'Midway International Airport', city: 'Chicago', country: 'United States' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States' },
  { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'United States' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States' },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'United States' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States' },
  
  // Major European Hubs
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom' },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy' },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { code: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Turkey' },
  
  // Asian Major Hubs
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'GMP', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  { code: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China' },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China' },
  { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
  
  // Middle East Hubs
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  
  // Indian Subcontinent
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan' },
  { code: 'LHE', name: 'Allama Iqbal International Airport', city: 'Lahore', country: 'Pakistan' },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh' },
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka' },
  
  // Australia & Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide', country: 'Australia' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },
  { code: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand' },
  
  // Canadian Major Cities
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada' },
  { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada' },
  { code: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton', country: 'Canada' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', country: 'Canada' },
  
  // Latin America
  { code: 'GRU', name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  { code: 'CGH', name: 'São Paulo-Congonhas Airport', city: 'São Paulo', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
  { code: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil' },
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina' },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico' },
  { code: 'SCL', name: 'Comodoro Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
  
  // Africa
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'JNB', name: 'OR Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa' },
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
  { code: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia' },
  
  // Popular Tourist Destinations
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Denpasar (Bali)', country: 'Indonesia' },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand' },
  { code: 'CNX', name: 'Chiang Mai International Airport', city: 'Chiang Mai', country: 'Thailand' },
  { code: 'REP', name: 'Siem Reap International Airport', city: 'Siem Reap', country: 'Cambodia' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
  { code: 'RGN', name: 'Yangon International Airport', city: 'Yangon', country: 'Myanmar' },
  { code: 'KEF', name: 'Keflavík International Airport', city: 'Reykjavik', country: 'Iceland' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
  { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal' },
  { code: 'OPO', name: 'Francisco Sá Carneiro Airport', city: 'Porto', country: 'Portugal' },
  { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic' },
  { code: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary' },
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow', country: 'Russia' },
  { code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg', country: 'Russia' },
  
  // Additional Important Hubs
  { code: 'YHZ', name: 'Halifax Stanfield International Airport', city: 'Halifax', country: 'Canada' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'United States' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'United States' },
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'United States' },
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'United States' },
  { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', country: 'United States' },
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', country: 'United States' },
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', country: 'United States' },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States' },
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'United States' },
  { code: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', country: 'United States' },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', country: 'United States' },
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', country: 'United States' },
  { code: 'STL', name: 'Lambert-St. Louis International Airport', city: 'St. Louis', country: 'United States' },
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', country: 'United States' },
  { code: 'PIT', name: 'Pittsburgh International Airport', city: 'Pittsburgh', country: 'United States' },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', country: 'United States' },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', country: 'United States' },
];

/**
 * An intelligent airport search function with enhanced matching capabilities.
 * @param query The search term.
 * @param limit The maximum number of results to return.
 * @returns An array of matching airports, sorted by relevance.
 */
export function searchAirports(query: string, limit: number = 10): Airport[] {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const lowerCaseQuery = query.toLowerCase().trim();
  
  // Handle common user input patterns
  const normalizedQuery = normalizeQuery(lowerCaseQuery);
  
  const scoredResults = airports
    .map((airport: Airport) => ({
      airport,
      score: calculateRelevanceScore(airport, normalizedQuery, lowerCaseQuery)
    }))
    .filter((result: { airport: Airport; score: number }) => result.score >= 100) // Minimum relevance threshold
    .sort((a: { airport: Airport; score: number }, b: { airport: Airport; score: number }) => b.score - a.score)
    .slice(0, limit)
    .map((result: { airport: Airport; score: number }) => result.airport);

  return scoredResults;
}

/**
 * Normalize query to handle common user input patterns
 */
function normalizeQuery(query: string): string {
  // Remove common airport suffixes that users might include
  const cleanQuery = query
    .replace(/\s+(airport|international|intl|regional)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanQuery;
}

/**
 * Calculate relevance score for an airport based on the search query
 */
function calculateRelevanceScore(airport: Airport, normalizedQuery: string, originalQuery: string): number {
  const code = airport.code.toLowerCase();
  const name = airport.name.toLowerCase();
  const city = airport.city.toLowerCase();
  const country = airport.country.toLowerCase();
  
  let score = 0;
  let hasExactMatch = false;
  
  // Exact code match gets highest priority (much higher than before)
  if (code === originalQuery) {
    score += 10000;
    hasExactMatch = true;
  } else if (code.startsWith(originalQuery) && originalQuery.length >= 2) {
    score += 8000;
    hasExactMatch = true;
  } else if (code.includes(originalQuery) && originalQuery.length >= 3) {
    score += 6000;
  }
  
  // Exact city name matches get very high priority
  if (city === normalizedQuery) {
    score += 9000;
    hasExactMatch = true;
  } else if (city.startsWith(normalizedQuery) && normalizedQuery.length >= 3) {
    score += 7000;
  } else if (city.includes(normalizedQuery) && normalizedQuery.length >= 4) {
    // Only allow city includes for longer queries to prevent irrelevant matches
    score += 500;
  }
  
  // Country matches (only for exact or starts with)
  if (country === normalizedQuery) {
    score += 4000;
  } else if (country.startsWith(normalizedQuery) && normalizedQuery.length >= 3) {
    score += 3000;
  }
  
  // Airport name matches (more restrictive)
  if (name.includes(normalizedQuery) && normalizedQuery.length >= 4) {
    score += 300;
  }
  
  // Handle common abbreviations and alternative names
  const alternativeMatches = getAlternativeMatches(airport, normalizedQuery);
  if (alternativeMatches > 0) {
    score += 2500;
    hasExactMatch = true;
  }
  
  // Multi-word query handling (more restrictive)
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);
  if (queryWords.length > 1) {
    const allText = `${name} ${city} ${country}`.toLowerCase();
    const matchingWords = queryWords.filter(word => 
      allText.includes(word) || city.includes(word) || country.includes(word)
    );
    
    if (matchingWords.length === queryWords.length) {
      score += 600; // All words match
    } else if (matchingWords.length > 0) {
      score += 150 * matchingWords.length; // Partial word matches
    }
  }
  
  // Apply relevance penalty for non-exact matches on short queries
  if (!hasExactMatch && originalQuery.length <= 3 && score < 1000) {
    score = Math.max(0, score - 200);
  }
  
  // Additional penalty for very loose matches
  if (score > 0 && score < 300 && !hasExactMatch) {
    score = 0; // Filter out very weak matches
  }
  
  return score;
}

/**
 * Check for alternative names and common abbreviations
 */
function getAlternativeMatches(airport: Airport, query: string): number {
  const alternatives: Record<string, string[]> = {
    'nyc': ['new york'],
    'ny': ['new york'],
    'la': ['los angeles'],
    'sf': ['san francisco'],
    'sfo': ['san francisco'],
    'chi': ['chicago'],
    'dc': ['washington'],
    'vegas': ['las vegas'],
    'miami': ['mia'],
    'london': ['lhr', 'lgw', 'stn', 'man'],
    'paris': ['cdg', 'ory'],
    'tokyo': ['hnd', 'nrt'],
    'seoul': ['icn', 'gmp'],
    'bangkok': ['bkk', 'dmk'],
    'istanbul': ['ist'],
    'dubai': ['dxb'],
    'singapore': ['sin'],
    'hong kong': ['hkg'],
    'sydney': ['syd'],
    'melbourne': ['mel'],
    'manchester': ['man'],
  };
  
  const cityLower = airport.city.toLowerCase();
  const codeLower = airport.code.toLowerCase();
  
  // Exact match check for alternatives
  if (alternatives[query]) {
    // Check if this airport matches any alternative for the query
    for (const alt of alternatives[query]) {
      if (cityLower === alt || codeLower === alt) {
        return 1;
      }
    }
  }
  
  // Reverse lookup - check if airport's city/code has alternatives that match query
  if (alternatives[cityLower] && alternatives[cityLower].includes(query)) {
    return 1;
  }
  
  if (alternatives[codeLower] && alternatives[codeLower].includes(query)) {
    return 1;
  }
  
  return 0;
}

/**
 * A React hook for searching airports.
 * @param initialQuery An optional initial search query.
 * @returns An object containing the search query, a function to set it, and the search results.
 */
export function useAirportSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    return searchAirports(query);
  }, [query]);

  return {
    query,
    setQuery,
    results,
  };
}