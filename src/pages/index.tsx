import React from 'react';
import SearchBar from '../components/SearchBar';
import PromoCarousel from '../components/PromoCarousel';
import CategorySlider from '../components/CategorySlider';
import FeaturedRestaurants from '../components/FeaturedRestaurants';
import RestaurantList from '../components/RestaurantList';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <SearchBar />
      <PromoCarousel />
      <CategorySlider />
      <FeaturedRestaurants />
      <RestaurantList />
    </div>
  );
}
