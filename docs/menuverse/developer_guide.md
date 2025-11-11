# MenuVerse Developer Guide

This guide provides instructions for developers building client applications (e.g., a customer-facing web or mobile app) that interact with the MenuVerse backend on Firebase.

## Backend Overview

The backend is built on Firebase and consists of two main services:

-   **Firebase Authentication**: Used to manage users. While the vendor app uses email/password, your customer app can use any Firebase provider (e.g., Anonymous, Google, etc.).
-   **Firestore**: A NoSQL database used to store all application data, including eatery profiles, menus, and orders.

The source of truth for the database schema and structure is `docs/backend.json`.

## 1. Setting up Firebase

First, you'll need to set up Firebase in your client-side JavaScript project.

```javascript
// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This should be stored securely, e.g., in environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
```
**Note**: The vendor app retrieves its configuration automatically. For your customer app, you will need to get the configuration from your Firebase project settings.

## 2. Authentication

Your customer app will need to authenticate users. For simplicity, you can start with **Anonymous Authentication**, which doesn't require users to create an account.

```javascript
import { signInAnonymously } from "firebase/auth";

// Sign in the user anonymously
signInAnonymously(auth)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("Signed in anonymously with UID:", user.uid);
  })
  .catch((error) => {
    console.error("Anonymous sign-in failed:", error);
  });
```

## 3. Database Interaction

All data is stored in Firestore. The structure is based on a top-level `eateries` collection.

### Fetching Eatery Information

To get the public profile of a specific eatery:

```javascript
import { doc, getDoc } from "firebase/firestore";

async function getEateryProfile(eateryId) {
  const eateryRef = doc(db, "eateries", eateryId);
  const docSnap = await getDoc(eateryRef);

  if (docSnap.exists()) {
    console.log("Eatery data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such eatery!");
    return null;
  }
}

// Example usage:
// const eateryId = "the_vendor_user_id";
// getEateryProfile(eateryId);
```

### Fetching Menu Items

Menu items are stored in a subcollection under each eatery.

```javascript
import { collection, query, getDocs } from "firebase/firestore";

async function getMenu(eateryId) {
  const menuItems = [];
  const q = query(collection(db, "eateries", eateryId, "menu_items"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    menuItems.push({ id: doc.id, ...doc.data() });
  });

  console.log("Menu Items:", menuItems);
  return menuItems;
}

// Example usage:
// const eateryId = "the_vendor_user_id";
// getMenu(eateryId);
```

### Placing an Order

To place an order, you need to create a new document in the `orders` subcollection for a specific eatery.

```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function placeOrder(eateryId, orderData) {
  try {
    const ordersRef = collection(db, "eateries", eateryId, "orders");
    
    const newOrder = {
      ...orderData,
      status: "Pending", // Initial status
      createdAt: serverTimestamp(), // Use server timestamp for reliability
    };

    const docRef = await addDoc(ordersRef, newOrder);
    console.log("Order placed with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}

// Example usage:
/*
const eateryId = "the_vendor_user_id";

const order = {
  eateryId: eateryId,
  customer: {
    name: "John Customer",
    email: "john.customer@example.com",
    address: "456 Oak Avenue, Springfield, USA"
  },
  items: [
    { id: "menu_item_id_1", name: "Classic Burger", quantity: 1, price: 12.99 },
    { id: "menu_item_id_2", name: "Fries", quantity: 1, price: 4.50 }
  ],
  totalAmount: 17.49,
};

placeOrder(eateryId, order);
*/
```

This guide should provide a solid foundation for your developers. Let me know if you have any other questions!

    