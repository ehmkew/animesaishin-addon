import { addonBuilder } from 'stremio-addon-sdk';
import { getLatestEpisodeAired } from './utils/getLatestEpisodeAired.js';
import { getLatestCompleted } from './utils/getLatestCompleted.js';

const builder = new addonBuilder({
  id: 'org.ehmkew.animesaishin',
  version: '1.1.0',
  name: 'AnimeSaishin Test',
  description: 'Discover the most recently aired anime episodes in real time.',
  resources: ['catalog'],
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'latest_episode',
      name: 'AnimeSaishin - Latest Episode',
      extraSupported: ['skip'],
    },
    {
      type: 'series',
      id: 'latest_completed',
      name: 'AnimeSaishin - Recently Completed',
      extraSupported: ['skip'],
    },
  ],
});


builder.defineCatalogHandler(async ({ id, extra }) => {
  if (id === 'latest_completed') {
    return await getLatestCompleted(extra);
  }
  if (id === 'latest_episode') {
    return await getLatestEpisodeAired(extra);
  }
  else {
    return { metas: [] };
  }
})

export default builder.getInterface();
