import gql from 'graphql-tag';

const query = gql`query Top($period: Period!, $date: CountDateInput!, $paging: Paging, $filters: FilterInput){
  topArtists(
    interval: {
      period: $period, date: $date
    },
    filter: $filters,
    paging: $paging
  )
  {
    artist {
      id
      name
      image
    }
    rank
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

`;

export default query;
