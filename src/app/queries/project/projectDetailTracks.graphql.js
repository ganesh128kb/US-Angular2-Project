import gql from 'graphql-tag';
const query = gql

`
query ProjectTracks(
  $id: ID!,
  $period: Period!,
  $date: CountDateInput!,
  $prevDate: CountDateInput!,
  $filters: FilterInput
) {
  totals: projectTracks(
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
    track {
      id
      name,
      releaseDate,
      earliestReleaseDate
			artist {
				id
				name
			}
      project {
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
  previous: projectTracks(
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
		track {
			id
			name,
			releaseDate,
			earliestReleaseDate
			artist {
				id
				name
			}
			project {
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
  rtd: projectTracks(
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
    track {
      id
      name,
      releaseDate,
      earliestReleaseDate
      project {
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
