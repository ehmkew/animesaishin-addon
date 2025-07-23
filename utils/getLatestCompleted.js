import { fetchGraphQL } from './fetchAnilist.js';
import { completedAnimeQuery } from '../graphql/query.js';

export async function getLatestCompleted(extra) {
    const skip = parseInt(extra?.skip || 0);
    const perPage = 30;
    const page = Math.floor(skip / perPage) + 1;

    const data = await fetchGraphQL(completedAnimeQuery, { page, perPage });
    if (!data || !data.Page || !data.Page.media) return { metas: [] };

    const metas = data.Page.media.map((anime) => {
        const end = anime.endDate;
        const dateString = end?.year ? `${end.year}-${end.month}-${end.day}` : 'Completed';
        return {
            id: anime.idMal ? `mal:${anime.idMal}` : anime.id.toString(),
            type: 'series',
            name: anime.title.english || anime.title.romaji,
            poster: anime.coverImage.large,
            posterShape: 'poster',
            description: `Completed on ${dateString}`
        };
    });
    console.log(`Returning Recently Completed ${metas.length} metas (skip=${skip})`)
    return { metas };
}