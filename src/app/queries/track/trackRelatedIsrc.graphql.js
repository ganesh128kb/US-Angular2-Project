import gql from 'graphql-tag';
const query = gql

`
query TrackRelatedIsrcs(
  $id: ID!,
  $period: Period!,
  $date: CountDateInput!,
  $prevDate: CountDateInput!,
  $filters: FilterInput
) {
  totals: trackRelatedIsrcs(
    trackId: $id,
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
    isrc {
      id
      name
      version
      releaseDate
      earliestReleaseDate
      track {
        id
        name
				project {
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
      }
      adjustedUnits {
        all
        digitalTracks
        streams
        audioStreams
        videoStreams
      }

  }
  previous: trackRelatedIsrcs(
    trackId: $id,
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
    isrc {
      id
      name,
      releaseDate,
      earliestReleaseDate
      track {
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
      }
      adjustedUnits {
        all
        digitalTracks
        streams
        audioStreams
        videoStreams
      }

  }
  rtd: trackRelatedIsrcs(
    trackId: $id,
  	interval: { period: All, date: $prevDate },
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
    isrc {
      id
      name,
      releaseDate,
      earliestReleaseDate
      track {
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
      }
      adjustedUnits {
        all
        digitalTracks
        streams
        audioStreams
        videoStreams
      }
  }
}
`;

export default query;
