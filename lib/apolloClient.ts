import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getFirebaseAuth } from './firebase/client';

// Build endpoint robustly: prefer NEXT_PUBLIC_SERVER_URL, else default to localhost:4000
const base = (() => {
  const env = process.env.NEXT_PUBLIC_SERVER_URL;
  if (env && /^https?:\/\//i.test(env)) return env;
  return 'http://localhost:4000';
})();

// Authentication link to add Firebase ID token
const authLink = setContext(async (_, { headers }) => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }

  return { headers };
});

const client = new ApolloClient({
  link: from([authLink, new HttpLink({ uri: base.replace(/\/$/, '') + '/graphql' })]),
  cache: new InMemoryCache(),
});

export default client;
