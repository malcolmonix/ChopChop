import React from 'react';
import styles from './FeaturedRestaurants.module.css';

export default function FeaturedRestaurants() {
  // Placeholder featured restaurants
  return (
    <div className={styles.featured}>
      <h2>Featured Restaurants</h2>
      <div className={styles.list}>
        <div className={styles.card}>Restaurant A</div>
        <div className={styles.card}>Restaurant B</div>
        <div className={styles.card}>Restaurant C</div>
      </div>
    </div>
  );
}
