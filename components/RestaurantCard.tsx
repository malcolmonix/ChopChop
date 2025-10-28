import React from 'react';
import Link from 'next/link';
import styles from '../styles/RestaurantCard.module.css';

export type RestaurantCardProps = {
  id: string;
  name: string;
  image?: string | null;
  logo?: string | null;
  logoUrl?: string | null;  // New field from admin panel
  bannerUrl?: string | null; // New field from admin panel
  cuisines?: string[];
  reviewAverage?: number | null;
  deliveryTime?: number | null; // minutes
  isAvailable?: boolean | null; // open/closed
  isActive?: boolean | null;
  href?: string; // optional override
};

function formatRating(r?: number | null) {
  if (r == null) return 'New';
  const rounded = Math.round(r * 10) / 10;
  return String(rounded);
}

function truncate(arr: string[] | undefined, maxChars = 34) {
  const text = (arr || []).join(', ');
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '…';
}

export default function RestaurantCard(props: RestaurantCardProps) {
  const {
    id,
    name,
    image,
    logo,
    logoUrl,
    bannerUrl,
    cuisines,
    reviewAverage,
    deliveryTime,
    isAvailable,
    isActive,
    href,
  } = props;

  const url = href || `/restaurant/${encodeURIComponent(id)}`;
  const closed = isActive === false || isAvailable === false;
  
  // Helper function to properly resolve image URLs
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a data URL (base64), return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // If it's a relative path from admin panel uploads
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      return `/api/images/${cleanPath}`;
    }
    
    // If it looks like a filename from uploads directory
    if (url.includes('_') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'))) {
      return `/api/images/uploads/restaurants/${url}`;
    }
    
    // Default: treat as relative to current domain
    return url;
  };
  
  // Use logoUrl/bannerUrl from admin panel, fallback to old image/logo fields
  const restaurantImage = getImageUrl(logoUrl || bannerUrl || image || undefined);
  const restaurantLogo = getImageUrl(logoUrl || logo || undefined);

  return (
    <Link href={url} className={styles.card} title={name}>
      <div className={styles.mediaWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {restaurantImage ? (
          <img src={restaurantImage} alt={name} className={styles.cover} />
        ) : (
          <div className={styles.placeholder} aria-label="Image placeholder" />
        )}
        <div className={styles.topBadges}>
          {closed ? (
            <span className={`${styles.badge} ${styles.badgeMuted}`}>Closed</span>
          ) : deliveryTime ? (
            <span className={`${styles.badge} ${styles.badgeDark}`}>{deliveryTime} min</span>
          ) : null}
        </div>
        {restaurantLogo && restaurantLogo !== restaurantImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurantLogo} alt="logo" className={styles.logo} />
        ) : null}
        <button className={styles.favoriteBtn} aria-label="Add to favorites" onClick={(e)=>{e.preventDefault();}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.001 20.727l-1.093-.998C5.86 15.106 2.401 12.01 2.401 8.216 2.401 5.12 4.972 2.55 8.07 2.55c1.683 0 3.304.734 4.33 1.89 1.027-1.156 2.648-1.89 4.331-1.89 3.097 0 5.668 2.57 5.668 5.666 0 3.794-3.458 6.89-8.506 11.514l-1.092.996z" stroke="#111827" strokeWidth="1.5" fill="#fff"/>
          </svg>
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{name}</h3>
          <div className={styles.rating} aria-label={`Rating ${formatRating(reviewAverage)}`}>
            <span className={styles.star}>★</span>
            <span>{formatRating(reviewAverage)}</span>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={styles.cuisines}>{truncate(cuisines)}</span>
        </div>
      </div>
    </Link>
  );
}
