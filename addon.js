import { addonBuilder } from 'stremio-addon-sdk';
import fetch from 'node-fetch';

const builder = new addonBuilder({
  id: 'org.masonqian.animesaishin',
  version: '1.0.0',
  name: 'AnimeSaishin',
  description: 'Discover the most recently aired anime episodes in real time.',
  resources: ['catalog'],
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'latest_anime',
      name: 'AnimeSaishin - Latest Airing',
      extraSupported: ['skip'],
    },
  ],
});

builder.defineCatalogHandler(async ({ id, extra }) => {
  if (id !== 'latest_anime') return { metas: [] }

  const skip = parseInt(extra?.skip || 0)
  const perPage = 30
  const page = Math.floor(skip / perPage) + 1

  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, format_in: [TV, ONA], status: RELEASING, sort: UPDATED_AT_DESC) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          nextAiringEpisode {
            airingAt
          }
        }
      }
    }`

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { page, perPage }
    }),
  })

  const json = await res.json()

  const metas = json.data.Page.media
    .filter((a) => a.nextAiringEpisode)
    .map((anime) => ({
      id: anime.id.toString(),
      type: 'series',
      name: anime.title.romaji,
      poster: anime.coverImage.large,
    }))

  return { metas }
})


export default builder.getInterface();
