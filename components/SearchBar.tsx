import React from 'react';
import styles from '../styles/SearchBar.module.css';

export default function SearchBar() {
  return (
    <div className={styles.searchBar}>
      <input type="text" placeholder="Search for food, restaurants..." />
      <button>🔍</button>
    </div>
  );
}
