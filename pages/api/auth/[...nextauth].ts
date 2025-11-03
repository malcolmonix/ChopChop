import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verificationCodes } from './send-code';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const PHONE_LOGIN_MUTATION = gql`
  mutation PhoneLogin($phoneNumber: String!) {
    phoneLogin(phoneNumber: $phoneNumber) {
      token
      user {
        _id
        phoneNumber
        name
      }
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'phone',
      name: 'Phone Number',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.code) {
          throw new Error('Phone number and verification code required');
        }

        // Verify the code
        const stored = verificationCodes.get(credentials.phoneNumber);
        
        if (!stored) {
          throw new Error('No verification code found. Please request a new code.');
        }

        if (stored.expiresAt < Date.now()) {
          verificationCodes.delete(credentials.phoneNumber);
          throw new Error('Verification code expired. Please request a new code.');
        }

        if (stored.code !== credentials.code) {
          throw new Error('Invalid verification code');
        }

        // Code is valid, remove it (one-time use)
        verificationCodes.delete(credentials.phoneNumber);

        // Authenticate with backend
        try {
          const { data } = await client.mutate({
            mutation: PHONE_LOGIN_MUTATION,
            variables: {
              phoneNumber: credentials.phoneNumber,
            },
          }) as { data: any }; // Type assertion for build compatibility

          if (data?.phoneLogin?.user) {
            return {
              id: data.phoneLogin.user._id,
              phoneNumber: data.phoneLogin.user.phoneNumber,
              name: data.phoneLogin.user.name || credentials.phoneNumber,
              token: data.phoneLogin.token,
            };
          }

          return null;
        } catch (error) {
          console.error('Phone login error:', error);
          throw new Error('Failed to authenticate');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = (user as any).phoneNumber;
        token.name = user.name;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
        (session.user as any).phoneNumber = token.phoneNumber;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
