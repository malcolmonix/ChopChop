import React from 'react';
import styles from '../styles/RestaurantList.module.css';
import RestaurantCard, { RestaurantCardProps } from './RestaurantCard';

type Props = {
  restaurants?: RestaurantCardProps[];
  title?: string;
};

export default function RestaurantList({ restaurants, title = 'All Restaurants' }: Props) {
  const sample: RestaurantCardProps[] = restaurants || [
    { id: 'r1', name: 'Mama J Kitchen', cuisines: ['Local'], image: null, reviewAverage: 4.3, deliveryTime: 20, isAvailable: true, isActive: true },
    { id: 'r2', name: 'Bella Pasta', cuisines: ['Italian'], image: null, reviewAverage: 4.6, deliveryTime: 28, isAvailable: true, isActive: true },
    { id: 'r3', name: 'Dragon Wok', cuisines: ['Chinese'], image: null, reviewAverage: 4.1, deliveryTime: 22, isAvailable: true, isActive: true },
  ];

  return (
    <div className={styles.restaurantList}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {sample.map((r) => (
          <div key={r.id} style={{ flex: '1 1 260px', maxWidth: 320 }}>
            <RestaurantCard {...r} />
          </div>
        ))}
      </div>
    </div>
  );
}
