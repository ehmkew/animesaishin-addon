import { fetchGraphQL } from './fetchAnilist.js'
import { airingScheduleQuery } from '../graphql/query.js'
import { formatTimeAgo } from './timeAgo.js'

export async function getLatestEpisodeAired(extra) {
    const skip = parseInt(extra?.skip || 0);
    const perPage = 30;
    const maxPages = 5;
    const now = Math.floor(Date.now() / 1000)
    const allAired = []
    let page = 1

    while (allAired.length < skip + perPage && page <= maxPages) {
        const data = await fetchGraphQL(airingScheduleQuery, {
            page,
            perPage: 50,
            now
        })

        const schedules = data?.Page?.airingSchedules || []

        for (const item of schedules) {
            const anime = item.media
            const airedAt = item.airingAt * 1000
            const timeAgo = formatTimeAgo(airedAt)

            if (!anime || !anime.title) continue

            allAired.push({
                id: anime.idMal ? `mal:${anime.idMal}` : anime.id.toString(),
                type: 'series',
                name: anime.title.english || anime.title.romaji,
                poster: anime.coverImage.large,
                posterShape: 'poster',
                description: `Episode ${item.episode} • Aired ${timeAgo}`
            })
        }

        page++
    }

    const paginated = allAired.slice(skip, skip + perPage);
    console.log(`Returning latest episode aired ${paginated.length} metas (skip=${skip})`);
    return { metas: paginated };
}