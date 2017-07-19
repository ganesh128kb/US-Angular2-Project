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
  track(id: $id) {
    id
    name
    image
		artist {
			id
			name
		}
		project {
			id
			name
		}
    totals: countsFor(
      interval: { period: $period, date: $date },
      filters: $filters,
      groupCounts: [
        { type: Totals },
        { type: Partner,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
          ]
        },
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
    previous: countsFor(
      interval: { period: $period, date: $prevDate },
      filters: $filters,
      groupCounts: [
        { type: Totals },
        { type: Partner,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
          ]
        },
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
    rtd: countsFor(
      interval: { period: All, date: $date },
      filters: $filters,
      groupCounts: [
        { type: Totals },
        { type: Partner,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
          ]
        },
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
