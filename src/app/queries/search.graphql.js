import gql from 'graphql-tag';

const query = gql

`
query Search($searchText: String!) {
    search(searchText: $searchText) {
    __typename
    ... on Artist {
      id
      name
    }
    ... on Project {
      id
      name
			artist{
	 			id
	 			name
 			}
    }
    ... on Track {
      id
      name
			artist {
				id
				name
			}
			project {
				id
				name
			}
    }
  }
}
`;

export default query;
