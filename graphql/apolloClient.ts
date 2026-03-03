import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// export const BASE_URL =
//   process.env.NODE_EN !== "development"
//     ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//     : "http://localhost:3000";

const client = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    headers: {
      Authorization: `Apikey ${process.env.NEXT_PUBLIC_STEPZEN_API_KEY}`,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
