import axios from "axios";

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

export async function addExp(uid, gainedExp) {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/users/add-exp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, gainedExp }),
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to update EXP");
  return data; // contains { message, level, exp }
}

export async function fetchUserEnrichedCards(uid, options = {}) {
  const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/albums/fetch-user?uid=${uid}`;

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch user cards");

  return data;
}

export const getUserCardByTrack = async (uid, trackId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_BACKEND_URL}/api/users/${uid}/card`,
    {
      params: { trackId },
    }
  );
  return res.data;
};

export async function getUserCardWithTrack(uid, trackId, options = {}) {
  const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/${uid}/card-with-track?trackId=${trackId}`;

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch card with track");

  return data; // { exists: true/false, card, track }
}

export async function saveOrReplaceCard(
  uid,
  { newCard, oldCard },
  options = {}
) {
  const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/save-card`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, newCard, oldCard }),
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save or replace card");

  return data;
}

export async function fetchAllArtists() {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/spotify/artists`
  );
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch artists");
  return data; // array of artist names
}

// export async function fetchTracksByArtist(artist) {
//   const res = await fetch(
//     `${
//       process.env.REACT_APP_BACKEND_URL
//     }/api/spotify/tracks-by-artist?artist=${encodeURIComponent(artist)}`
//   );
//   const data = await res.json();

//   if (!res.ok)
//     throw new Error(data.error || "Failed to fetch tracks by artist");
//   return data; // array of { track, album }
// }

export async function fetchTracksByArtist(artist, page = 1, limit = 6) {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/tracks-by-artist?artist=${artist}&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return await res.json();
}

export async function fetchUserAlbums(uid, page = 1, limit = 9) {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/users/albums?uid=${uid}&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch user albums");
  return await res.json();
}

export async function fetchAllPacks(page = 1, limit = 9) {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/spotify/all-packs?page=${page}&limit=${limit}`
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch packs");
  return data;
}

export async function fetchUserCount(options = {}) {
  const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/count`;

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch user count");

  return data.count;
}

export async function fetchUserSummary(uid, options = {}) {
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/users/${uid}/summary`,
    options
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch user summary");
  return data;
}
