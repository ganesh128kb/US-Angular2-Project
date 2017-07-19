import gql from 'graphql-tag';

const query = gql `
query Details($id: ID!, $precision: Period!, $startDate: CountDateInput!, $endDate: CountDateInput!, $filters: FilterInput) {
  project(id: $id) {
    id
    name
    weekly: countsFor(range: {precision: $precision, startDate: $startDate, endDate: $endDate}, filters: $filters, groupCounts: [{ type: Country, sort: [{ prop: AllAdjustedUnits, ordering: Desc }], paging: {skip: 0, limit: 4}}]) {
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
        audioStreams
        videoStreams
        digitalTracks
      }
      adjustedUnits {
        all
        streams
        audioStreams
        videoStreams
        digitalTracks
      }
      euro {
        all
        streams
        audioStreams
        videoStreams
        digitalTracks
      }
    }
  }
}
`;

export default query;
