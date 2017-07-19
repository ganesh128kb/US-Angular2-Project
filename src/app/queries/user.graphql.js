import gql from 'graphql-tag';
const query = gql

`
query User($email: String!) {
  getUser(email: $email) {
    active
    email
    internal
    firstName
    lastName
    defaultTerritory {
      id
      name
      type
    }
    revenue
    externalInfo {
      termsChecked
      country
      company
      clientType
      phoneNumber
      artists
      defaultLabel {
        id
        name
        type
      }
    }
    internalInfo {
      aliasID
      title
      department
      countryId
      lineManager
      workAddress
      company
      defaultLabel {
        id
        name
        type
      }
    }
    subscriptions {
      newsletterMonthly
      benchmarkAlerts
      dataNotifications
    }
  }
}
`;

export default query;
