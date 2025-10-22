import React, { useEffect, useState } from "react";
import { fetchUserAlbums } from "../api/spotify";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";
import CardReRender from "../components/CardRerenderer";

export default function CollectionPage({ page }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const fetchCards = async (pageNum = 1) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await fetchUserAlbums(currentUser.uid, pageNum, 9);
      console.log("Fetched user albums:", data);
      setCards(Array.isArray(data.cards) ? data.cards : []);
      setPagination(data.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("Failed to load collection:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === "collection" && user) {
      fetchCards(1);
    }
  }, [page, user]);

  const handlePageChange = (newPage) => {
    if (newPage !== pagination.currentPage) {
      fetchCards(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center bg-transparent relative z-20">
      <h1 className="text-6xl font-concent mb-4">Collection</h1>
      <div className="flex-1  overflow-auto">
        {user ? (
          <>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {Array.isArray(cards) && cards.length > 0 ? (
                    cards.map((card, i) => (
                      <CardReRender
                        key={i}
                        cardData={{
                          data: {
                            border: card.border,
                            bgSubId: card.bgSubId,
                          },
                          track: {
                            album: {
                              image: card?.album?.images?.[0]?.url,
                              name: card?.album?.name,
                              artist: card?.album?.artists
                                ?.map((a) => a.name)
                                .join(", "),
                            },
                            track: {
                              name: card?.track?.name,
                            },
                          },
                        }}
                      />
                    ))
                  ) : (
                    <div>No cards found</div>
                  )}
                </div>

                {/* Pagination */}
                <div className="grid grid-cols-5 lg:grid-cols-10 justify-center mt-4 gap-2 text-center">
                  {Array.from({ length: pagination.totalPages }, (_, idx) => (
                    <div
                      key={idx + 1}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`px-3 py-1 rounded cursor-target ${
                        pagination.currentPage === idx + 1
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>Login to view your collection</>
        )}
      </div>
    </div>
  );
}
