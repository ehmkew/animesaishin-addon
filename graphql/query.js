export const airingScheduleQuery = `
    query ($page: Int, $perPage: Int, $now: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(
          airingAt_lesser: $now,
          sort: TIME_DESC
        ) {
          media {
            id
            idMal
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
          episode
          airingAt
        }
      }
    }`;

export const completedAnimeQuery = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          type: ANIME,
          format_in: [TV, ONA],
          status: FINISHED,
          sort: END_DATE_DESC
        ) {
          id
          idMal
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          endDate {
            year
            month
            day
          }
        }
      }
    }`;