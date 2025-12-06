// GraphQL queries and mutations for ChopChop app
import { gql } from '@apollo/client';

// Restaurant Queries
export const GET_RESTAURANTS = gql`
  query GetRestaurants($search: String, $cuisine: String, $limit: Int) {
    restaurants(search: $search, cuisine: $cuisine, limit: $limit) {
      id
      name
      description
      cuisine
      isActive
      rating
      reviewCount
      logoUrl
      bannerUrl
      contactEmail
      address
      phoneNumber
      priceRange
    }
  }
`;

export const GET_RESTAURANT = gql`
  query GetRestaurant($id: ID!) {
    restaurant(id: $id) {
      id
      name
      description
      cuisine
      isActive
      rating
      reviewCount
      logoUrl
      bannerUrl
      contactEmail
      address
      phoneNumber
      priceRange
      openingHours {
        day
        open
        close
        isClosed
      }
    }
  }
`;

// Menu Queries
export const GET_MENU_ITEMS = gql`
  query GetMenuItems($restaurantId: ID!) {
    menuItems(restaurantId: $restaurantId) {
      id
      name
      description
      price
      category
      imageUrl
      isAvailable
      isVegetarian
      isVegan
      allergens
    }
  }
`;

export const GET_MENU_CATEGORIES = gql`
  query GetMenuCategories($restaurantId: ID!) {
    menuCategories(restaurantId: $restaurantId) {
      id
      name
      description
      displayOrder
    }
  }
`;

// Restaurant Mutations (for owners)
export const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant(
    $name: String!
    $description: String!
    $contactEmail: String
    $phoneNumber: String
    $address: String
    $cuisine: [String!]
    $priceRange: String
    $openingHours: [OpeningHourInput!]
  ) {
    createRestaurant(
      name: $name
      description: $description
      contactEmail: $contactEmail
      phoneNumber: $phoneNumber
      address: $address
      cuisine: $cuisine
      priceRange: $priceRange
      openingHours: $openingHours
    ) {
      id
      name
      description
      cuisine
      isActive
      openingHours {
        day
        open
        close
        isClosed
      }
    }
  }
`;

export const UPDATE_RESTAURANT = gql`
  mutation UpdateRestaurant(
    $id: ID!
    $description: String
    $phoneNumber: String
    $isActive: Boolean
  ) {
    updateRestaurant(
      id: $id
      description: $description
      phoneNumber: $phoneNumber
      isActive: $isActive
    ) {
      id
      name
      description
      phoneNumber
      isActive
    }
  }
`;

// Menu Mutations (for owners)
export const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem(
    $restaurantId: ID!
    $name: String!
    $description: String
    $price: Float!
    $category: String
    $imageUrl: String
    $isAvailable: Boolean
    $isVegetarian: Boolean
    $isVegan: Boolean
    $allergens: [String!]
  ) {
    createMenuItem(
      restaurantId: $restaurantId
      name: $name
      description: $description
      price: $price
      category: $category
      imageUrl: $imageUrl
      isAvailable: $isAvailable
      isVegetarian: $isVegetarian
      isVegan: $isVegan
      allergens: $allergens
    ) {
      id
      name
      price
      isAvailable
      category
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem(
    $id: ID!
    $price: Float
    $isAvailable: Boolean
    $description: String
  ) {
    updateMenuItem(
      id: $id
      price: $price
      isAvailable: $isAvailable
      description: $description
    ) {
      id
      name
      price
      isAvailable
      description
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;

export const CREATE_MENU_CATEGORY = gql`
  mutation CreateMenuCategory(
    $restaurantId: ID!
    $name: String!
    $description: String
    $displayOrder: Int
  ) {
    createMenuCategory(
      restaurantId: $restaurantId
      name: $name
      description: $description
      displayOrder: $displayOrder
    ) {
      id
      name
      description
      displayOrder
    }
  }
`;

// Order Queries
export const GET_USER_ORDERS = gql`
  query GetUserOrders {
    orders {
      id
      orderId
      status: orderStatus
      total: paidAmount
      createdAt
      items: orderItems {
        id
        name: title
        quantity
        price
      }
      restaurant
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderId
      status: orderStatus
      total: paidAmount
      createdAt
      items: orderItems {
        id
        name: title
        quantity
        price
      }
      restaurant
      address
      orderDate
      expectedTime
      statusHistory {
        status
        timestamp
        note
      }
    }
  }
`;

// Order Mutations
export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: OrderInput!) {
    placeOrder(input: $input) {
      id
      orderId
      status
      total
    }
  }
`;

  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
  updateOrderStatus(id: $id, status: $status) {
    id
    status
  }
}
`;

export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($orderId: ID!, $status: String!, $paymentMethod: String!, $transactionId: String) {
  updatePaymentStatus(orderId: $orderId, status: $status, paymentMethod: $paymentMethod, transactionId: $transactionId) {
    id
    status
    total
  }
}
`;

// Order Tracking Queries
export const GET_ORDER_TRACKING = gql`
  query GetOrderTracking($orderId: String!) {
  orderTracking(orderId: $orderId) {
    id
    orderId
    restaurantId
    restaurantName
    orderStatus
    deliveryStatus
    paymentMethod
    orderAmount
    deliveryCharges
    tipping
    taxationAmount
    paidAmount
    deliveryAddress
    deliveryLatitude
    deliveryLongitude
    instructions
    orderDate
    createdAt
    estimatedDeliveryTime
      customer {
      name
      email
      phone
      address
    }
      items {
      id
      name
      quantity
      price
      variation
      addons
    }
      rider {
      name
      phone
      vehicleNumber
        currentLocation {
        latitude
        longitude
      }
    }
      statusHistory {
      status
      timestamp
      message
        location {
        latitude
        longitude
      }
    }
  }
}
`;

export const SUBSCRIBE_ORDER_STATUS = gql`
  subscription OnOrderStatusChanged($orderId: String!) {
  orderStatusChanged(orderId: $orderId) {
    orderId
    orderStatus
    deliveryStatus
    estimatedDeliveryTime
      rider {
      name
      phone
        currentLocation {
        latitude
        longitude
      }
    }
  }
}
`;