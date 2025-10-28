import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Build endpoint robustly: prefer NEXT_PUBLIC_SERVER_URL, else default to localhost:4000
const base = (() => {
  const env = process.env.NEXT_PUBLIC_SERVER_URL;
  if (env && /^https?:\/\//i.test(env)) return env;
  return 'http://localhost:4000';
})();

const client = new ApolloClient({
  link: new HttpLink({
    uri: base.replace(/\/$/, '') + '/graphql',
  }),
  cache: new InMemoryCache(),
});

export default client;
