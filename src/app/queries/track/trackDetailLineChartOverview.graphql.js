import gql from 'graphql-tag';

const query = gql `
query Details($id: ID!, $precision: Period!, $startDate: CountDateInput!, $endDate: CountDateInput!, $filters: FilterInput) {
  track(id: $id) {
    id
    name
    totals: countsFor(range: {precision: $precision, startDate: $startDate, endDate: $endDate}, filters: $filters, select: [{prop: AllUnits}, {prop: AllAdjustedUnits},{prop: AllEuro}], groupCounts: [{type: Totals, sort: [{prop: AllUnits, ordering: Desc}], paging: {skip: 0, limit: 4}}]) {
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
