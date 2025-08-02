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
