import gql from 'graphql-tag';
const query = gql
`query Top($period: Period!, $date: CountDateInput!,
    $filters:  FilterInput, $paging: Paging){
  topProjects(
    interval: {
      period: $period, date: $date
    },
    filter: $filters,
    paging: $paging
  )
  {
  	project {
      id
      name
      releaseDate
      earliestReleaseDate
      artist {
        id
        name
      }
      image
    }
    rank
    originalRank
    totals {
      interval {
        period
        date {
          year
          quarter
          month
          week
          day
        }
      }
      territory {
        type
        id
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
        type
        id
      }
      units {
        all
        previous
        rtd
        streams
        audioStreams
        videoStreams
        digitalAlbums
        digitalTracks
        physicalAlbums
      }
      adjustedUnits {
        all
        previous
        rtd
        streams
        audioStreams
        videoStreams
        digitalAlbums
        digitalTracks
        physicalAlbums
      }
      euro {
        all
        previous
        rtd
        streams
        audioStreams
        videoStreams
        digitalAlbums
        digitalTracks
        physicalAlbums
      }
    }
  }
}
`;

export default query;
