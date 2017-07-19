import gql from 'graphql-tag';
const query = gql

`
query Details(
  $id: ID!,
  $period: Period!,
  $date: CountDateInput!,
  $prevDate: CountDateInput,
  $filters: FilterInput
) {
  project(id: $id) {
    id
    name
    image
    artist {
      name
      id
    }
    totals: countsFor(
      interval: { period: $period, date: $date },
      filters: $filters,
      groupCounts: [
        { type: Country,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc },
          ]
        }
      ]
    ) {
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
      genre {
        id
        name
      }
      label {
        id
        type
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
    previous: countsFor(
      interval: { period: $period, date: $prevDate },
      filters: $filters,
      groupCounts: [
        { type: Country,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc },
          ]
        }
      ]
    ) {
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
      genre {
        id
        name
      }
      label {
        id
        type
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
    rtd: countsFor(
      interval: { period: All, date: $prevDate },
      filters: $filters,
      groupCounts: [
        { type: Country,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc },
          ]
        }
      ]
    ) {
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
      genre {
        id
        name
      }
      label {
        id
        type
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
