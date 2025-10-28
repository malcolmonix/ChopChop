import React from 'react';
import styles from './PromoCarousel.module.css';

export default function PromoCarousel() {
  // Placeholder carousel
  return (
    <div className={styles.carousel}>
      <div className={styles.slide}>Promo 1</div>
      <div className={styles.slide}>Promo 2</div>
      <div className={styles.slide}>Promo 3</div>
    </div>
  );
}
