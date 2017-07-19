import { ApolloClient, createNetworkInterface, IntrospectionFragmentMatcher } from 'apollo-client';

import { AppState } from './app.service';

// const API_URL = process.env.API_HOST;
// console.log(API_URL);

const myFragmentMatcher: any = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          "kind": "UNION",
          "name": "SearchResult",
          "possibleTypes": [
            {
              "name": "Album"
            },
            {
              "name": "Artist"
            },
            {
              "name": "Isrc"
            },
            {
              "name": "Project"
            },
            {
              "name": "Track"
            }
          ]
        },
      ],
    }
}
});

// by default, this client will send queries to `/graphql` (relative to the URL of your app)
const client = new ApolloClient({
  fragmentMatcher: myFragmentMatcher,
  networkInterface: createNetworkInterface({
    // uri: API_URL
    uri: 'https://swift-dev.umusic.com/graphql'
    // uri: 'http://localhost:5777/graphql'
  })
  // shouldBatch: true
});

export function provideClient(): ApolloClient {
	return client;
}
