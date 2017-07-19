import gql from 'graphql-tag';

const query = gql `
query Details($id: ID!, $precision: Period!, $startDate: CountDateInput!, $endDate: CountDateInput!, $filters: FilterInput) {
  project(id: $id) {
    id
    name
    totals: countsFor(range: {precision: $precision, startDate: $startDate, endDate: $endDate}, filters: $filters, select: [{prop: StreamUnits}, {prop: StreamAdjustedUnits}], groupCounts: [{type: Partner, sort: [{prop: AllUnits, ordering: Desc}], paging: {skip: 0, limit: 4}}]) {
      interval {
        date {
          year
          quarter
          month
          week
          day
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
        streams
      }
      adjustedUnits {
        all
        streams
      }
    }
  }
}
`;

export default query;
