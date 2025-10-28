import React from 'react';
import styles from '../styles/FeaturedRestaurants.module.css';
import RestaurantCard, { RestaurantCardProps } from './RestaurantCard';

type Props = {
  restaurants?: RestaurantCardProps[];
  title?: string;
};

export default function FeaturedRestaurants({ restaurants, title = 'Featured Restaurants' }: Props) {
  const sample: RestaurantCardProps[] = restaurants || [
    { id: 's1', name: 'Sunset Diner', image: null, cuisines: ['American', 'Grill'], reviewAverage: 4.5, deliveryTime: 25, isAvailable: true, isActive: true },
    { id: 's2', name: 'Spice Route', image: null, cuisines: ['Indian'], reviewAverage: 4.2, deliveryTime: 30, isAvailable: true, isActive: true },
    { id: 's3', name: 'Green Garden', image: null, cuisines: ['Salads', 'Vegan'], reviewAverage: 4.7, deliveryTime: 20, isAvailable: true, isActive: true },
  ];

  return (
    <div className={styles.featured}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {sample.map((r) => (
          <div key={r.id} style={{ minWidth: 240 }}>
            <RestaurantCard {...r} />
          </div>
        ))}
      </div>
    </div>
  );
}
