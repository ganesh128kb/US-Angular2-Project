import gql from 'graphql-tag';
const query = gql

`
query Details($id: ID!, $period: Period!, $date: CountDateInput!, $prevDate: CountDateInput, $filters: FilterInput) {
  artist(id: $id) {
    id
    name
    image
    totals: countsFor(interval: {period: $period, date: $date}, filters: $filters, groupCounts: [{type: Totals}, {type: Partner, sort: [{prop: AllAdjustedUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}, {type: Country, sort: [{prop: AllAdjustedUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}]) {
      interval {
        date {
          year
          quarter
          month
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
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      adjustedUnits {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      euro {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
    }
    previous: countsFor(interval: {period: $period, date: $prevDate}, filters: $filters, groupCounts: [{type: Totals}, {type: Partner, sort: [{prop: AllUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}, {type: Country, sort: [{prop: AllUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}]) {
      interval {
        date {
          year
          quarter
          month
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
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      adjustedUnits {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      euro {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
    }
    rtd: countsFor(interval: {period: All, date: $date}, filters: $filters, groupCounts: [{type: Totals}, {type: Partner, sort: [{prop: AllAdjustedUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}, {type: Country, sort: [{prop: AllAdjustedUnits, ordering: Desc}, {prop: AllEuro, ordering: Desc}]}]) {
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
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      adjustedUnits {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
      euro {
        all
        physicalAlbums
        digitalAlbums
        digitalTracks
        streams
        audioStreams
        videoStreams
        airplays
      }
    }
  }
}
`
;

export default query;
