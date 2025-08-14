import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Star, ExternalLink, Plane, Clock, MapPin } from 'lucide-react';
import type { FlightResult } from '../endpoints/travel/search/flights_POST.schema';
import type { HotelResult } from '../endpoints/travel/search/hotels_POST.schema';
import type { PackageResult } from '../endpoints/travel/search/packages_POST.schema';
import styles from './SearchResultCard.module.css';

interface SearchResultCardProps {
  result: FlightResult | HotelResult | PackageResult;
  type: 'flight' | 'hotel' | 'package';
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, type }) => {
  const renderFlightCard = (flight: FlightResult) => (
    <>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <img src={flight.airlineLogoUrl} alt={flight.airline} className={styles.airlineLogo} />
          <div>
            <h3 className={styles.title}>{flight.airline}</h3>
            <div className={styles.flightTimes}>
              <span>{new Date(flight.departTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <Plane size={16} className={styles.flightIcon} />
              <span>{new Date(flight.arriveTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        <div className={styles.price}>£{flight.price.toLocaleString()}</div>
      </div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <Clock size={16} />
          <span>{flight.duration}</span>
        </div>
        <div className={styles.detailItem}>
          <MapPin size={16} />
          <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
        </div>
      </div>
    </>
  );

  const renderHotelCard = (hotel: HotelResult) => (
    <>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <img src={hotel.imageUrl} alt={hotel.name} className={styles.hotelImage} />
          <div>
            <h3 className={styles.title}>{hotel.name}</h3>
            <div className={styles.rating}>
              <Star size={16} className={styles.starIcon} />
              <span>{hotel.rating}</span>
            </div>
          </div>
        </div>
        <div className={styles.price}>£{hotel.pricePerNight.toLocaleString()}<span className={styles.priceUnit}>/night</span></div>
      </div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <MapPin size={16} />
          <span>{hotel.location}</span>
        </div>
      </div>
      <div className={styles.amenities}>
        {hotel.amenities.slice(0, 3).map((amenity: string, index: number) => (
          <Badge key={index} variant="secondary" className={styles.amenityBadge}>
            {amenity}
          </Badge>
        ))}
        {hotel.amenities.length > 3 && (
          <Badge variant="outline">+{hotel.amenities.length - 3} more</Badge>
        )}
      </div>
    </>
  );

  const renderPackageCard = (pkg: PackageResult) => (
    <>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <img src={pkg.hotelImageUrl} alt={pkg.hotelName} className={styles.hotelImage} />
          <div>
            <h3 className={styles.title}>{pkg.title}</h3>
            <div className={styles.packageDetails}>
              <div className={styles.rating}>
                <Star size={16} className={styles.starIcon} />
                <span>{pkg.hotelRating}</span>
              </div>
              <Badge variant="default" className={styles.aiPlanBadge}>AI Plan</Badge>
            </div>
          </div>
        </div>
        <div className={styles.price}>£{pkg.totalPrice.toLocaleString()}</div>
      </div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.packageLabel}>Hotel:</span>
          <span>{pkg.hotelName}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.packageLabel}>Airline:</span>
          <span>{pkg.airlineName}</span>
        </div>
      </div>
      <div className={styles.amenities}>
        {pkg.inclusions.slice(0, 3).map((inclusion: string, index: number) => (
          <Badge key={index} variant="secondary" className={styles.amenityBadge}>
            {inclusion}
          </Badge>
        ))}
        {pkg.inclusions.length > 3 && (
          <Badge variant="outline">+{pkg.inclusions.length - 3} more</Badge>
        )}
      </div>
    </>
  );

  return (
    <div className={styles.card}>
      {type === 'flight' && renderFlightCard(result as FlightResult)}
      {type === 'hotel' && renderHotelCard(result as HotelResult)}
      {type === 'package' && renderPackageCard(result as PackageResult)}
      
      <div className={styles.footer}>
        <Button 
          size="sm"
          onClick={() => window.open(result.bookNowUrl, '_blank')}
        >
          <ExternalLink size={14} />
          Book Now
        </Button>
      </div>
    </div>
  );
};