import gql from 'graphql-tag';
const query = gql

`
query ArtistProjects(
  $id: ID!,
  $period: Period!,
  $date: CountDateInput!,
  $prevDate: CountDateInput!,
  $filters: FilterInput
) {
  totals: artistProjects(
    artistId: $id,
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
    project {
      id
      name,
      releaseDate,
      earliestReleaseDate
      artist {
        id
        name
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
  previous: artistProjects(
    artistId: $id,
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
		project {
      id
      name,
      releaseDate,
      earliestReleaseDate
      artist {
        id
        name
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
  rtd: artistProjects(
    artistId: $id,
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
		project {
      id
      name,
      releaseDate,
      earliestReleaseDate
      artist {
        id
        name
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
