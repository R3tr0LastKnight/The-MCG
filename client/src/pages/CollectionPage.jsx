import React, { useEffect, useState } from "react";
import { fetchUserAlbums } from "../api/spotify";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";
import CardReRender from "../components/CardRerenderer";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer.jsx";

export default function CollectionPage({ page }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchCards = async (pageNum = 1) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await fetchUserAlbums(currentUser.uid, pageNum, 9);
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

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setOpen(true);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center bg-transparent relative z-20">
          <h1 className="text-6xl font-concent mb-4">Collection</h1>

          <div className="flex-1 overflow-auto">
            {user ? (
              loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                    {Array.isArray(cards) && cards.length > 0 ? (
                      cards.map((card, i) => (
                        <div key={i} onClick={() => handleCardClick(card)}>
                          <CardReRender
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
                        </div>
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
              )
            ) : (
              <>Login to view your collection</>
            )}
          </div>
        </div>

        {/* Drawer Content */}
        <DrawerContent className="bg-white">
          {selectedCard && (
            <>
              <div
                className={`absolute left-1/2 bottom-[60%] transform -translate-x-1/2 -translate-y-1/2 transition ${
                  open ? "" : "hidden"
                }`}
              >
                <CardReRender
                  cardData={{
                    data: {
                      border: selectedCard.border,
                      bgSubId: selectedCard.bgSubId,
                    },
                    track: {
                      album: {
                        image: selectedCard?.album?.images?.[0]?.url,
                        name: selectedCard?.album?.name,
                        artist: selectedCard?.album?.artists
                          ?.map((a) => a.name)
                          .join(", "),
                      },
                      track: {
                        name: selectedCard?.track?.name,
                      },
                    },
                  }}
                  type="new"
                />
              </div>

              <DrawerDescription>
                <div className="p-4 rounded-xl relative bg-white lg:bg-transparent z-40 items-center flex gap-2 flex-col">
                  <h1 className="font-concent text-3xl lg:text-6xl  whitespace-nowrap">
                    Card Details
                  </h1>

                  <div className="flex flex-col justify-start  gap-2 text-xl  mt-4 font-libertinus">
                    <p>
                      <span className="font-bold">Album:</span>{" "}
                      {selectedCard?.album?.name}
                    </p>
                    <p>
                      <span className="font-bold">Track:</span>{" "}
                      {selectedCard?.track?.name}
                    </p>
                    <p>
                      <span className="font-bold">Artist:</span>{" "}
                      {selectedCard?.album?.artists
                        ?.map((a) => a.name)
                        .join(", ")}
                    </p>
                    <p>
                      <span className="font-bold">Popularity:</span>{" "}
                      {selectedCard?.album?.popularity}
                    </p>
                    <p>
                      <span className="font-bold">Release Date:</span>{" "}
                      {selectedCard?.album?.release_date}
                    </p>
                  </div>
                </div>
              </DrawerDescription>

              <DrawerFooter>
                <DrawerClose>
                  <div className="flex w-full justify-center">
                    <div
                      className="cursor-target border py-2 px-3 w-20 rounded bg-white hover:text-white hover:bg-black"
                      onClick={() => {
                        setSelectedCard(null);
                        setOpen(false);
                      }}
                    >
                      Back
                    </div>
                  </div>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
