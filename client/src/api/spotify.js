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
  return data; // array of { artist, album, cover, spotifyUrl }
}
