import gql from 'graphql-tag';

const query = gql `
query Filters{
  metadata {
    partners {
      id
      name
      priorityPartner
    }
    territories {
      regions {
        id
        name
        type
        order
        partners {
          id
          name
          priorityPartner
      }
      }
      countries {
        id
        name
        type
        order
        segments{
          id
          name
          type
        }
        partners {
          id
          name
          priorityPartner
          }
      }
    }
    genres {
      id
      name
    }
    labels {
      segments {
        id
        name
      }
      families {
        id
        name
      }
    }
  }
}
`;

export default query;
