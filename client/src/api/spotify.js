export async function searchAlbumByName(artist, album) {
  const res = await fetch(
    `${
      process.env.REACT_APP_BACKEND_URL
    }/api/spotify/album?artist=${encodeURIComponent(
      artist
    )}&album=${encodeURIComponent(album)}`
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Search failed");
  return data;
}

export async function fetchAllEnrichedAlbums() {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/spotify/albums/fetch-all`
  );
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch albums");
  return data;
}

export async function fetchTracks() {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/spotify/random-tracks`
  );
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch albums");
  return data;
}

export async function fetchRandomTrack({ album, artist }, options = {}) {
  const url = `${
    process.env.REACT_APP_BACKEND_URL
  }/api/spotify/random-tracks?albumName=${encodeURIComponent(
    album
  )}&artistName=${encodeURIComponent(artist)}`;

  const res = await fetch(url, options);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch random track");

  return data;
}

export async function saveCard(uid, cardData, options = {}) {
  const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/add-card`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, cardData }),
    ...options, // allow override (e.g. headers, signal)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save card");

  return data;
}
