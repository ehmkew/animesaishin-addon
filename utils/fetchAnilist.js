import fetch from 'node-fetch'

export async function fetchGraphQL(query, variables = {}) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })

  const json = await res.json()

  if (json.errors) {
    console.error('AniList API error:', JSON.stringify(json.errors, null, 2))
    return null
  }

  return json.data
}
