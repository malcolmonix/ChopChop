import React from 'react';
import styles from '../styles/CategorySlider.module.css';

const categories = [
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Desserts', icon: '🍰' },
];

export default function CategorySlider() {
  return (
    <div className={styles.slider}>
      {categories.map((cat) => (
        <div key={cat.name} className={styles.category}>
          <span className={styles.icon}>{cat.icon}</span>
          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
