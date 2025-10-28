import React from 'react';
import styles from '../styles/RestaurantHero.module.css';

export type RestaurantHeroProps = {
  name: string;
  bannerImage?: string | null; // background image
  logo?: string | null;        // display picture
  address?: string | null;
  phone?: string | null;
  isClosed?: boolean | null;
};

export default function RestaurantHero({ name, bannerImage, logo, address, phone, isClosed }: RestaurantHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.banner} style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}>
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? (
            <img src={logo} alt={`${name} logo`} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder} aria-label="Logo placeholder" />
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{name}</h1>
          <div className={styles.metaRow}>
            {address ? <span className={styles.meta}>{address}</span> : null}
            {phone ? <span className={styles.dot} /> : null}
            {phone ? <span className={styles.meta}>📞 {phone}</span> : null}
          </div>
          {isClosed ? (
            <div className={`${styles.badge} ${styles.badgeMuted}`}>Closed</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
