import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInAnonymously: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock localStorage with spy functions
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === 'cart') {
      return localStorageMock._store[key] || null
    }
    return null
  }),
  setItem: jest.fn((key, value) => {
    localStorageMock._store[key] = value
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock._store[key]
  }),
  clear: jest.fn(() => {
    localStorageMock._store = {}
  }),
  _store: {}
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock._store = {}
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})