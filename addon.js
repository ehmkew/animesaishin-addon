import { addonBuilder } from 'stremio-addon-sdk';
import fetch from 'node-fetch';

function formatTimeAgo(timestamp) {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const builder = new addonBuilder({
  id: 'org.masonqian.animesaishin',
  version: '1.0.1',
  name: 'AnimeSaishin',
  description: 'Discover the most recently aired anime episodes in real time.',
  resources: ['catalog'],
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'latest_anime',
      name: 'AnimeSaishin - Recently Released',
      extraSupported: ['skip'],
    },
  ],
});


builder.defineCatalogHandler(async ({ extra }) => {
  const skip = parseInt(extra?.skip || 0)
  const perPage = 30
  const page = 1 // We'll fetch a larger set manually to control filtering

  const now = Math.floor(Date.now() / 1000)

  const query = `
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
    }`

  const variables = {
    page,
    perPage: 100, // grab more and paginate manually after filtering
    now
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })

  const json = await response.json()

  if (!json.data) {
    console.error("AniList API error:", json.errors)
    return { metas: [] }
  }

  const seen = new Set()
  const metas = json.data.Page.airingSchedules
    .filter(item => item.media && item.media.idMal && !seen.has(item.media.idMal))
    .map(item => {
      const media = item.media
      const title = media.title.english || media.title.romaji || 'Untitled'
      const airedAt = item.airingAt * 1000
      const timeAgo = formatTimeAgo(airedAt)
      seen.add(item.media.idMal)

      return {
        id: `mal:${item.media.idMal}`,
        type: 'series',
        name: `${title}`,
        poster: item.media.coverImage.large,
        posterShape: 'poster',
        description: `Episode ${item.episode} • Aired ${timeAgo}`
      }
    })

  // Manual skip/pagination (Stremio will send `extra.skip`)
  const paginated = metas.slice(skip, skip + perPage)

  console.log(`Returning ${paginated.length} metas to Stremio`)

  return { metas: paginated }
})

export default builder.getInterface();
