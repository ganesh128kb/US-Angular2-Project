import gql from 'graphql-tag';
const query = gql

`
query ProjectAlbums(
  $id: ID!,
  $period: Period!,
  $date: CountDateInput!,
  $prevDate: CountDateInput!,
  $filters: FilterInput
) {
  totals: projectAlbums(
    projectId: $id,
      interval: { period: $period, date: $date },
    filters: $filters,
    select: [{prop: AllUnits}, {prop: AllAdjustedUnits}, {prop: AllEuro}],
    sort:  { prop: AllAdjustedUnits, ordering: Desc }

  ) {
    interval {
      date {
        year
        quarter
        month
        week
        day
      }
    }
		album {
      id
      name,
      releaseDate,
     	version
      project {
        id
        name
        artist {
          id
          name
        }
      }
    }
      units {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }
      adjustedUnits {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }

  }
  previous: projectAlbums(
    projectId: $id,
      interval: { period: $period, date: $prevDate },
    filters: $filters,
    select: [{prop: AllUnits}, {prop: AllAdjustedUnits}, {prop: AllEuro}],
    sort:  { prop: AllAdjustedUnits, ordering: Desc }

  ) {
    interval {
      date {
        year
        quarter
        month
        week
        day
      }
    }
		album {
      id
      name,
      releaseDate,
     	version
      project {
        id
        name
        artist {
          id
          name
        }
      }
    }
      units {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }
      adjustedUnits {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }

  }
  rtd: projectAlbums(
    projectId: $id,
      interval: { period: All, date: $date },
    filters: $filters,
    select: [{prop: AllUnits}, {prop: AllAdjustedUnits}, {prop: AllEuro}],
    sort:  { prop: AllAdjustedUnits, ordering: Desc }

  ) {
    interval {
      date {
        year
        quarter
        month
        week
        day
      }
    }
		album {
      id
      name,
      releaseDate,
     	version
      project {
        id
        name
        artist {
          id
          name
        }
      }
    }
      units {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }
      adjustedUnits {
				all
        digitalTracks
        streams
        audioStreams
        videoStreams
        physicalAlbums
        digitalAlbums
      }
  }
}
`;

export default query;
