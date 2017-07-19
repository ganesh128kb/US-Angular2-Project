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
        { type: FreePaid,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
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
    digitalTracks
    streams
    audioStreams
    videoStreams
  }
  freeUnits {
    all
    digitalTracks
    streams
    audioStreams
    videoStreams
  }
  paidUnits {
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
  freeAdjustedUnits {
    all
    digitalTracks
    streams
    audioStreams
    videoStreams
  }
  paidAdjustedUnits {
    all
    digitalTracks
    streams
    audioStreams
    videoStreams
  }
  euro {
    all
    digitalTracks
    streams
    audioStreams
    videoStreams
  }
    }
    previous: countsFor(
      interval: { period: $period, date: $prevDate },
      filters: $filters,
            groupCounts: [
        { type: FreePaid,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
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
  digitalTracks
  streams
  audioStreams
  videoStreams
}
freeUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
paidUnits {
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
freeAdjustedUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
paidAdjustedUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
euro {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
    }
    rtd: countsFor(
      interval: { period: All, date: $date },
      filters: $filters,
            groupCounts: [
        { type: FreePaid,
          sort: [
            { prop: AllAdjustedUnits, ordering: Desc },
            { prop: AllEuro, ordering: Desc }
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
  digitalTracks
  streams
  audioStreams
  videoStreams
}
freeUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
paidUnits {
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
freeAdjustedUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
paidAdjustedUnits {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
euro {
  all
  digitalTracks
  streams
  audioStreams
  videoStreams
}
    }
  }
}
`;

export default query;