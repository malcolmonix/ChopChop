# FILE_TREE for ChopChop

**Run Commands:**
- cd ChopChop && npm install
- cd ChopChop && npm run dev

**Directory Tree (truncated):**

- app/
  - layout.tsx
  - not-found.tsx
- APP-STATE-SUMMARY.md
- CART-MIGRATION-FIX.md
- CHOPCHOP-EXTRACTION-COMPLETE.md
- ChopChop.code-workspace
- components/
  - AddressManager.tsx
  - CategorySlider.tsx
  - ChopChopRestaurantCard.tsx
  - ChopChopSearchBar.tsx
  - CitySearch.tsx
  - ErrorBoundary.tsx
  - FeaturedRestaurants.tsx
  - Header.tsx
  - HeroBanner.tsx
  - LocationPicker.tsx
  - PromoCarousel.tsx
  - RandomFoodBanner.tsx
  - RestaurantCard.tsx
  - RestaurantHero.tsx
  - RestaurantList.tsx
  - SearchBar.tsx
  - UserMenu.tsx
- CONSUMER-READY-FEATURES.md
- debug-firebase.js
- DEPLOYMENT-TROUBLESHOOTING.md
- docker-compose.yml
- Dockerfile
- docs/
  - MenuVerseDocs/
    - backend.json
    - blueprint.md
    - developer_guide.md
    - firebase_env.md
    - ORDER_STATUS_SYNC.md
    - QUICK_START_STATUS_SYNC_TEST.md
- e2e/
  - authentication-flow.spec.ts
  - checkout-flow.spec.ts
  - complete-order-flow.spec.ts
  - INTERACTIVE-TESTING.md
  - order-flow-interactive.spec.ts
  - order-tracking.spec.ts
  - README.md
  - restaurant-flow.spec.ts
  - search-and-navigation.spec.ts
- E2E-TEST-REPORT.md
- EVALUATION-COMPLETE.md
- EVALUATION-INDEX.md
- EXTRACTION-COMPLETE.md
- FIREBASE-DOMAIN-FIX.md
- fix-restaurant-names.js
- GITHUB-ENV-SETUP.md
- GITHUB-SECRETS-SETUP.md
- GITHUB-SETUP-CHECKLIST.md
- GITHUB-SETUP-COMPLETE.md
- IMPLEMENTATION-SUMMARY.md
- jest.config.js
- jest.setup.js
- lib/
  - apolloClient.ts
  - cart.tsx
  - components/
    - address-picker.tsx
    - city-restaurant-list.tsx
    - city-toggle.tsx
    - enhanced-location-picker.tsx
    - error-boundary.tsx
    - interactive-map.tsx
    - loading.tsx
    - location-management.tsx
    - map-picker.tsx
    - mobile-menu.tsx
    - modern-location-picker.tsx
    - OrderStatusTimeline.tsx
    - profile-address-manager.tsx
    - profile-address-manager.tsx.bak
    - protected-route.tsx
    - skeletons.tsx
    - TrackingInfo.tsx
  - context/
    - cart.context.tsx
    - firebase-auth.context.tsx
    - toast.context.tsx
  - data/
    - sample-menuverse-data.js
  - firebase/
    - client.ts
    - menuverse.ts
    - order-sync.ts
    - orders.ts
    - server.ts
  - graphql/
    - queries.ts
  - hooks/
    - use-chopchop-restaurants.ts
    - use-firebase-token.ts
    - use-menuverse.ts
    - useCustomerOrders.ts
    - useLocationFlow.ts
    - useLocationSearch.ts
    - useUserProfile.ts
  - services/
    - chopchop-restaurants.ts
    - city-service.ts
    - image-upload.ts
    - location-service.ts
    - location-storage.ts
    - menuverse-api.ts
    - menuverse.ts
    - moonify.service.ts
    - order-tracking.ts
    - order.service.ts
    - restaurant-api.ts
    - user-profile.ts
  - types/
    - menuverse.ts
  - utils/
    - debug-restaurants.ts
    - logger.ts
    - seed-menuverse.ts
    - seo.ts
    - validation.ts
- next-env.d.ts
- next.config.mjs
- ORDER-FLOW-ENHANCEMENT-COMPLETE.md
- package-lock.json
- package.json
- pages/
  - api/
    - auth/
      - send-code.ts
      - [...nextauth].ts
    - check-menu.ts
    - debug/
      - check-directories.ts
      - test-image-api.ts
    - debug-menu.ts
    - health.ts
    - images/
      - [...imagePath].ts
    - seed-database.ts
    - sync-orders.ts
    - test-cart.ts
    - test-menuverse.ts
    - user/
      - me.ts
    - webhooks/
      - menuverse-order-update.ts
  - cart.tsx
  - check-firebase-data.tsx
  - checkout-enhanced.tsx
  - checkout-original.tsx
  - checkout.tsx
  - ChopChop.code-workspace
  - chopchop.tsx
  - debug-env.tsx
  - dev/
    - auth-debug.tsx
  - discovery.tsx
  - firebase-debug.tsx
  - firebase-test.tsx
  - index-original.tsx
  - index.tsx
  - login.tsx
  - menuverse/
    - [id].tsx
  - menuverse-demo.tsx
  - menuverse-test.tsx
  - order-confirmation.tsx
  - order-details/
    - [orderId].tsx
  - order-flow-demo.tsx
  - order-flow-test.tsx
  - orders.tsx
  - payment/
    - bank-transfer.tsx
    - card.tsx
    - mobile-money.tsx
  - profile.tsx
  - register.tsx
  - restaurant/
    - [id].tsx
  - restaurant-owner/
    - dashboard.tsx
    - menu/
      - [id].tsx
  - seed-data.tsx
  - simple-home.tsx
  - _app.tsx
- playwright.config.ts
- postcss.config.js
- PRODUCTION-READY-SUMMARY.md
- PROJECT-EVALUATION.md
- PROJECT-STATUS.md
- public/
  - favicon.ico
- README.md
- scripts/
  - link-admin-uploads.bat
  - link-admin-uploads.sh
  - seed-firestore.js
  - test-order-flow.sh
- src/
  - components/
    - CategorySlider.module.css
    - CategorySlider.tsx
    - FeaturedRestaurants.module.css
    - FeaturedRestaurants.tsx
    - PromoCarousel.module.css
    - PromoCarousel.tsx
    - RestaurantList.module.css
    - RestaurantList.tsx
    - SearchBar.module.css
    - SearchBar.tsx
  - pages/
    - index.tsx
  - styles/
    - Home.module.css
- styles/
  - CategorySlider.module.css
  - FeaturedRestaurants.module.css
  - globals.css
  - Home.module.css
  - HomeGrid.module.css
  - LocationPicker.module.css
  - PromoCarousel.module.css
  - RestaurantCard.module.css
  - RestaurantHero.module.css
  - RestaurantList.module.css
  - SearchBar.module.css
- tailwind.config.js
- test-api-connection.js
- test-api.js
- test-customer-orders-simple.js
- test-customer-orders.js
- test-order-flow.js
- test-order-mutation.js
- test-simple-order.js
- test-vendor-orders.js
- TODO-TRACKER.md
- tsconfig.json
- tsconfig.tsbuildinfo
- update-restaurant-names.js
- WORKFLOW-FIXES-COMPLETE.md
- __tests__/
  - index.test.js
  - integration/
    - system-health.test.js

**JSON manifest:**

{
  "generatedAt": "2025-11-25T12:02:01.702Z",
  "project": "ChopChop",
  "entries": [
    {
      "name": "app",
      "type": "dir",
      "children": [
        {
          "name": "layout.tsx",
          "type": "file"
        },
        {
          "name": "not-found.tsx",
          "type": "file"
        }
      ]
    },
    {
      "name": "APP-STATE-SUMMARY.md",
      "type": "file"
    },
    {
      "name": "CART-MIGRATION-FIX.md",
      "type": "file"
    },
    {
      "name": "CHOPCHOP-EXTRACTION-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "ChopChop.code-workspace",
      "type": "file"
    },
    {
      "name": "components",
      "type": "dir",
      "children": [
        {
          "name": "AddressManager.tsx",
          "type": "file"
        },
        {
          "name": "CategorySlider.tsx",
          "type": "file"
        },
        {
          "name": "ChopChopRestaurantCard.tsx",
          "type": "file"
        },
        {
          "name": "ChopChopSearchBar.tsx",
          "type": "file"
        },
        {
          "name": "CitySearch.tsx",
          "type": "file"
        },
        {
          "name": "ErrorBoundary.tsx",
          "type": "file"
        },
        {
          "name": "FeaturedRestaurants.tsx",
          "type": "file"
        },
        {
          "name": "Header.tsx",
          "type": "file"
        },
        {
          "name": "HeroBanner.tsx",
          "type": "file"
        },
        {
          "name": "LocationPicker.tsx",
          "type": "file"
        },
        {
          "name": "PromoCarousel.tsx",
          "type": "file"
        },
        {
          "name": "RandomFoodBanner.tsx",
          "type": "file"
        },
        {
          "name": "RestaurantCard.tsx",
          "type": "file"
        },
        {
          "name": "RestaurantHero.tsx",
          "type": "file"
        },
        {
          "name": "RestaurantList.tsx",
          "type": "file"
        },
        {
          "name": "SearchBar.tsx",
          "type": "file"
        },
        {
          "name": "UserMenu.tsx",
          "type": "file"
        }
      ]
    },
    {
      "name": "CONSUMER-READY-FEATURES.md",
      "type": "file"
    },
    {
      "name": "debug-firebase.js",
      "type": "file"
    },
    {
      "name": "DEPLOYMENT-TROUBLESHOOTING.md",
      "type": "file"
    },
    {
      "name": "docker-compose.yml",
      "type": "file"
    },
    {
      "name": "Dockerfile",
      "type": "file"
    },
    {
      "name": "docs",
      "type": "dir",
      "children": [
        {
          "name": "MenuVerseDocs",
          "type": "dir",
          "children": [
            {
              "name": "backend.json",
              "type": "file"
            },
            {
              "name": "blueprint.md",
              "type": "file"
            },
            {
              "name": "developer_guide.md",
              "type": "file"
            },
            {
              "name": "firebase_env.md",
              "type": "file"
            },
            {
              "name": "ORDER_STATUS_SYNC.md",
              "type": "file"
            },
            {
              "name": "QUICK_START_STATUS_SYNC_TEST.md",
              "type": "file"
            }
          ]
        }
      ]
    },
    {
      "name": "e2e",
      "type": "dir",
      "children": [
        {
          "name": "authentication-flow.spec.ts",
          "type": "file"
        },
        {
          "name": "checkout-flow.spec.ts",
          "type": "file"
        },
        {
          "name": "complete-order-flow.spec.ts",
          "type": "file"
        },
        {
          "name": "INTERACTIVE-TESTING.md",
          "type": "file"
        },
        {
          "name": "order-flow-interactive.spec.ts",
          "type": "file"
        },
        {
          "name": "order-tracking.spec.ts",
          "type": "file"
        },
        {
          "name": "README.md",
          "type": "file"
        },
        {
          "name": "restaurant-flow.spec.ts",
          "type": "file"
        },
        {
          "name": "search-and-navigation.spec.ts",
          "type": "file"
        }
      ]
    },
    {
      "name": "E2E-TEST-REPORT.md",
      "type": "file"
    },
    {
      "name": "EVALUATION-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "EVALUATION-INDEX.md",
      "type": "file"
    },
    {
      "name": "EXTRACTION-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "FIREBASE-DOMAIN-FIX.md",
      "type": "file"
    },
    {
      "name": "fix-restaurant-names.js",
      "type": "file"
    },
    {
      "name": "GITHUB-ENV-SETUP.md",
      "type": "file"
    },
    {
      "name": "GITHUB-SECRETS-SETUP.md",
      "type": "file"
    },
    {
      "name": "GITHUB-SETUP-CHECKLIST.md",
      "type": "file"
    },
    {
      "name": "GITHUB-SETUP-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "IMPLEMENTATION-SUMMARY.md",
      "type": "file"
    },
    {
      "name": "jest.config.js",
      "type": "file"
    },
    {
      "name": "jest.setup.js",
      "type": "file"
    },
    {
      "name": "lib",
      "type": "dir",
      "children": [
        {
          "name": "apolloClient.ts",
          "type": "file"
        },
        {
          "name": "cart.tsx",
          "type": "file"
        },
        {
          "name": "components",
          "type": "dir",
          "children": [
            {
              "name": "address-picker.tsx",
              "type": "file"
            },
            {
              "name": "city-restaurant-list.tsx",
              "type": "file"
            },
            {
              "name": "city-toggle.tsx",
              "type": "file"
            },
            {
              "name": "enhanced-location-picker.tsx",
              "type": "file"
            },
            {
              "name": "error-boundary.tsx",
              "type": "file"
            },
            {
              "name": "interactive-map.tsx",
              "type": "file"
            },
            {
              "name": "loading.tsx",
              "type": "file"
            },
            {
              "name": "location-management.tsx",
              "type": "file"
            },
            {
              "name": "map-picker.tsx",
              "type": "file"
            },
            {
              "name": "mobile-menu.tsx",
              "type": "file"
            },
            {
              "name": "modern-location-picker.tsx",
              "type": "file"
            },
            {
              "name": "OrderStatusTimeline.tsx",
              "type": "file"
            },
            {
              "name": "profile-address-manager.tsx",
              "type": "file"
            },
            {
              "name": "profile-address-manager.tsx.bak",
              "type": "file"
            },
            {
              "name": "protected-route.tsx",
              "type": "file"
            },
            {
              "name": "skeletons.tsx",
              "type": "file"
            },
            {
              "name": "TrackingInfo.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "context",
          "type": "dir",
          "children": [
            {
              "name": "cart.context.tsx",
              "type": "file"
            },
            {
              "name": "firebase-auth.context.tsx",
              "type": "file"
            },
            {
              "name": "toast.context.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "data",
          "type": "dir",
          "children": [
            {
              "name": "sample-menuverse-data.js",
              "type": "file"
            }
          ]
        },
        {
          "name": "firebase",
          "type": "dir",
          "children": [
            {
              "name": "client.ts",
              "type": "file"
            },
            {
              "name": "menuverse.ts",
              "type": "file"
            },
            {
              "name": "order-sync.ts",
              "type": "file"
            },
            {
              "name": "orders.ts",
              "type": "file"
            },
            {
              "name": "server.ts",
              "type": "file"
            }
          ]
        },
        {
          "name": "graphql",
          "type": "dir",
          "children": [
            {
              "name": "queries.ts",
              "type": "file"
            }
          ]
        },
        {
          "name": "hooks",
          "type": "dir",
          "children": [
            {
              "name": "use-chopchop-restaurants.ts",
              "type": "file"
            },
            {
              "name": "use-firebase-token.ts",
              "type": "file"
            },
            {
              "name": "use-menuverse.ts",
              "type": "file"
            },
            {
              "name": "useCustomerOrders.ts",
              "type": "file"
            },
            {
              "name": "useLocationFlow.ts",
              "type": "file"
            },
            {
              "name": "useLocationSearch.ts",
              "type": "file"
            },
            {
              "name": "useUserProfile.ts",
              "type": "file"
            }
          ]
        },
        {
          "name": "services",
          "type": "dir",
          "children": [
            {
              "name": "chopchop-restaurants.ts",
              "type": "file"
            },
            {
              "name": "city-service.ts",
              "type": "file"
            },
            {
              "name": "image-upload.ts",
              "type": "file"
            },
            {
              "name": "location-service.ts",
              "type": "file"
            },
            {
              "name": "location-storage.ts",
              "type": "file"
            },
            {
              "name": "menuverse-api.ts",
              "type": "file"
            },
            {
              "name": "menuverse.ts",
              "type": "file"
            },
            {
              "name": "moonify.service.ts",
              "type": "file"
            },
            {
              "name": "order-tracking.ts",
              "type": "file"
            },
            {
              "name": "order.service.ts",
              "type": "file"
            },
            {
              "name": "restaurant-api.ts",
              "type": "file"
            },
            {
              "name": "user-profile.ts",
              "type": "file"
            }
          ]
        },
        {
          "name": "types",
          "type": "dir",
          "children": [
            {
              "name": "menuverse.ts",
              "type": "file"
            }
          ]
        },
        {
          "name": "utils",
          "type": "dir",
          "children": [
            {
              "name": "debug-restaurants.ts",
              "type": "file"
            },
            {
              "name": "logger.ts",
              "type": "file"
            },
            {
              "name": "seed-menuverse.ts",
              "type": "file"
            },
            {
              "name": "seo.ts",
              "type": "file"
            },
            {
              "name": "validation.ts",
              "type": "file"
            }
          ]
        }
      ]
    },
    {
      "name": "next-env.d.ts",
      "type": "file"
    },
    {
      "name": "next.config.mjs",
      "type": "file"
    },
    {
      "name": "ORDER-FLOW-ENHANCEMENT-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "package-lock.json",
      "type": "file"
    },
    {
      "name": "package.json",
      "type": "file"
    },
    {
      "name": "pages",
      "type": "dir",
      "children": [
        {
          "name": "api",
          "type": "dir",
          "children": [
            {
              "name": "auth",
              "type": "dir",
              "children": [
                {
                  "name": "send-code.ts",
                  "type": "file"
                },
                {
                  "name": "[...nextauth].ts",
                  "type": "file"
                }
              ]
            },
            {
              "name": "check-menu.ts",
              "type": "file"
            },
            {
              "name": "debug",
              "type": "dir",
              "children": [
                {
                  "name": "check-directories.ts",
                  "type": "file"
                },
                {
                  "name": "test-image-api.ts",
                  "type": "file"
                }
              ]
            },
            {
              "name": "debug-menu.ts",
              "type": "file"
            },
            {
              "name": "health.ts",
              "type": "file"
            },
            {
              "name": "images",
              "type": "dir",
              "children": [
                {
                  "name": "[...imagePath].ts",
                  "type": "file"
                }
              ]
            },
            {
              "name": "seed-database.ts",
              "type": "file"
            },
            {
              "name": "sync-orders.ts",
              "type": "file"
            },
            {
              "name": "test-cart.ts",
              "type": "file"
            },
            {
              "name": "test-menuverse.ts",
              "type": "file"
            },
            {
              "name": "user",
              "type": "dir",
              "children": [
                {
                  "name": "me.ts",
                  "type": "file"
                }
              ]
            },
            {
              "name": "webhooks",
              "type": "dir",
              "children": [
                {
                  "name": "menuverse-order-update.ts",
                  "type": "file"
                }
              ]
            }
          ]
        },
        {
          "name": "cart.tsx",
          "type": "file"
        },
        {
          "name": "check-firebase-data.tsx",
          "type": "file"
        },
        {
          "name": "checkout-enhanced.tsx",
          "type": "file"
        },
        {
          "name": "checkout-original.tsx",
          "type": "file"
        },
        {
          "name": "checkout.tsx",
          "type": "file"
        },
        {
          "name": "ChopChop.code-workspace",
          "type": "file"
        },
        {
          "name": "chopchop.tsx",
          "type": "file"
        },
        {
          "name": "debug-env.tsx",
          "type": "file"
        },
        {
          "name": "dev",
          "type": "dir",
          "children": [
            {
              "name": "auth-debug.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "discovery.tsx",
          "type": "file"
        },
        {
          "name": "firebase-debug.tsx",
          "type": "file"
        },
        {
          "name": "firebase-test.tsx",
          "type": "file"
        },
        {
          "name": "index-original.tsx",
          "type": "file"
        },
        {
          "name": "index.tsx",
          "type": "file"
        },
        {
          "name": "login.tsx",
          "type": "file"
        },
        {
          "name": "menuverse",
          "type": "dir",
          "children": [
            {
              "name": "[id].tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "menuverse-demo.tsx",
          "type": "file"
        },
        {
          "name": "menuverse-test.tsx",
          "type": "file"
        },
        {
          "name": "order-confirmation.tsx",
          "type": "file"
        },
        {
          "name": "order-details",
          "type": "dir",
          "children": [
            {
              "name": "[orderId].tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "order-flow-demo.tsx",
          "type": "file"
        },
        {
          "name": "order-flow-test.tsx",
          "type": "file"
        },
        {
          "name": "orders.tsx",
          "type": "file"
        },
        {
          "name": "payment",
          "type": "dir",
          "children": [
            {
              "name": "bank-transfer.tsx",
              "type": "file"
            },
            {
              "name": "card.tsx",
              "type": "file"
            },
            {
              "name": "mobile-money.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "profile.tsx",
          "type": "file"
        },
        {
          "name": "register.tsx",
          "type": "file"
        },
        {
          "name": "restaurant",
          "type": "dir",
          "children": [
            {
              "name": "[id].tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "restaurant-owner",
          "type": "dir",
          "children": [
            {
              "name": "dashboard.tsx",
              "type": "file"
            },
            {
              "name": "menu",
              "type": "dir",
              "children": [
                {
                  "name": "[id].tsx",
                  "type": "file"
                }
              ]
            }
          ]
        },
        {
          "name": "seed-data.tsx",
          "type": "file"
        },
        {
          "name": "simple-home.tsx",
          "type": "file"
        },
        {
          "name": "_app.tsx",
          "type": "file"
        }
      ]
    },
    {
      "name": "playwright.config.ts",
      "type": "file"
    },
    {
      "name": "postcss.config.js",
      "type": "file"
    },
    {
      "name": "PRODUCTION-READY-SUMMARY.md",
      "type": "file"
    },
    {
      "name": "PROJECT-EVALUATION.md",
      "type": "file"
    },
    {
      "name": "PROJECT-STATUS.md",
      "type": "file"
    },
    {
      "name": "public",
      "type": "dir",
      "children": [
        {
          "name": "favicon.ico",
          "type": "file"
        }
      ]
    },
    {
      "name": "README.md",
      "type": "file"
    },
    {
      "name": "scripts",
      "type": "dir",
      "children": [
        {
          "name": "link-admin-uploads.bat",
          "type": "file"
        },
        {
          "name": "link-admin-uploads.sh",
          "type": "file"
        },
        {
          "name": "seed-firestore.js",
          "type": "file"
        },
        {
          "name": "test-order-flow.sh",
          "type": "file"
        }
      ]
    },
    {
      "name": "src",
      "type": "dir",
      "children": [
        {
          "name": "components",
          "type": "dir",
          "children": [
            {
              "name": "CategorySlider.module.css",
              "type": "file"
            },
            {
              "name": "CategorySlider.tsx",
              "type": "file"
            },
            {
              "name": "FeaturedRestaurants.module.css",
              "type": "file"
            },
            {
              "name": "FeaturedRestaurants.tsx",
              "type": "file"
            },
            {
              "name": "PromoCarousel.module.css",
              "type": "file"
            },
            {
              "name": "PromoCarousel.tsx",
              "type": "file"
            },
            {
              "name": "RestaurantList.module.css",
              "type": "file"
            },
            {
              "name": "RestaurantList.tsx",
              "type": "file"
            },
            {
              "name": "SearchBar.module.css",
              "type": "file"
            },
            {
              "name": "SearchBar.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "pages",
          "type": "dir",
          "children": [
            {
              "name": "index.tsx",
              "type": "file"
            }
          ]
        },
        {
          "name": "styles",
          "type": "dir",
          "children": [
            {
              "name": "Home.module.css",
              "type": "file"
            }
          ]
        }
      ]
    },
    {
      "name": "styles",
      "type": "dir",
      "children": [
        {
          "name": "CategorySlider.module.css",
          "type": "file"
        },
        {
          "name": "FeaturedRestaurants.module.css",
          "type": "file"
        },
        {
          "name": "globals.css",
          "type": "file"
        },
        {
          "name": "Home.module.css",
          "type": "file"
        },
        {
          "name": "HomeGrid.module.css",
          "type": "file"
        },
        {
          "name": "LocationPicker.module.css",
          "type": "file"
        },
        {
          "name": "PromoCarousel.module.css",
          "type": "file"
        },
        {
          "name": "RestaurantCard.module.css",
          "type": "file"
        },
        {
          "name": "RestaurantHero.module.css",
          "type": "file"
        },
        {
          "name": "RestaurantList.module.css",
          "type": "file"
        },
        {
          "name": "SearchBar.module.css",
          "type": "file"
        }
      ]
    },
    {
      "name": "tailwind.config.js",
      "type": "file"
    },
    {
      "name": "test-api-connection.js",
      "type": "file"
    },
    {
      "name": "test-api.js",
      "type": "file"
    },
    {
      "name": "test-customer-orders-simple.js",
      "type": "file"
    },
    {
      "name": "test-customer-orders.js",
      "type": "file"
    },
    {
      "name": "test-order-flow.js",
      "type": "file"
    },
    {
      "name": "test-order-mutation.js",
      "type": "file"
    },
    {
      "name": "test-simple-order.js",
      "type": "file"
    },
    {
      "name": "test-vendor-orders.js",
      "type": "file"
    },
    {
      "name": "TODO-TRACKER.md",
      "type": "file"
    },
    {
      "name": "tsconfig.json",
      "type": "file"
    },
    {
      "name": "tsconfig.tsbuildinfo",
      "type": "file"
    },
    {
      "name": "update-restaurant-names.js",
      "type": "file"
    },
    {
      "name": "WORKFLOW-FIXES-COMPLETE.md",
      "type": "file"
    },
    {
      "name": "__tests__",
      "type": "dir",
      "children": [
        {
          "name": "index.test.js",
          "type": "file"
        },
        {
          "name": "integration",
          "type": "dir",
          "children": [
            {
              "name": "system-health.test.js",
              "type": "file"
            }
          ]
        }
      ]
    }
  ]
}
