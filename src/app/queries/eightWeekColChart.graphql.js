import gql from 'graphql-tag';

const query = gql `
query Weekly(
  $id: ID!,
  $precision: Period!,
  $startDate: CountDateInput!,
  $endDate: CountDateInput!,
  $filters: FilterInput
) {
  artist(id: $id) {
    id
    name
    weekly: countsFor(
      range: { precision: $precision, startDate: $startDate, endDate: $endDate },
      filters: $filters,
      groupCounts: [
        { type: Country,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc }
          ]
        }
      ]
    ) {
      interval {
        date {
          year
          week
        }
      }
      territory {
        id
        name
        type
      }
      partner {
        id
        name
      }
      units {
        all
      }
      adjustedUnits {
        all
      }
      euro {
        all
      }
    }
  }
}
`;

export default query;
