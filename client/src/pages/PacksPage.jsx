import React, { useState, useEffect } from "react";
import { useUser } from "../utils/userContext";
import { fetchAllPacks } from "../api/spotify";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
} from "../components/ui/drawer.jsx";
import PackReRenderer from "../components/PackReRenderer";

const PacksPage = () => {
  const { user } = useUser();
  const [packs, setPacks] = useState([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  const loadPacks = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await fetchAllPacks(pageNum, 9);
      setPacks(data.packs || []);
      setPagination(data.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("Failed to fetch packs:", err);
      setPacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNum) => loadPacks(pageNum);

  useEffect(() => {
    if (user) loadPacks(1);
  }, [user]);

  const handlePackClick = (pack) => {
    setSelectedPack(pack);
    setOpen(true);
  };

  if (!user)
    return (
      <div className="flex h-full items-center justify-center text-xl">
        Login to view your packs
      </div>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center relative z-20">
        <h1 className="text-6xl font-concent mb-8">Packs</h1>

        <div className="flex-1 w- overflow-auto justify-center">
          {loading ? (
            <div className="text-lg text-gray-400 text-center">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                {packs.length > 0 ? (
                  packs.map((pack, i) => (
                    <div key={i} onClick={() => handlePackClick(pack)}>
                      <PackReRenderer packData={pack} />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No packs found</div>
                )}
              </div>

              {/* Pagination */}
              <div className="grid grid-cols-5 lg:grid-cols-10 justify-center mt-4 gap-2 text-center">
                {Array.from({ length: pagination.totalPages }, (_, idx) => (
                  <div
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-3 py-1 rounded-md transition-all duration-300 cursor-target ${
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
        </div>
      </div>

      {/* Drawer Content */}
      <DrawerContent className="bg-white">
        {selectedPack && (
          <>
            <div
              className={`absolute left-1/2 bottom-[60%] transform -translate-x-1/2 -translate-y-1/2 transition ${
                open ? "" : "hidden"
              }`}
            >
              <PackReRenderer packData={selectedPack} />
            </div>

            <DrawerDescription>
              <div className="p-6 rounded-lg relative bg-white lg:bg-transparent z-40 items-center flex flex-col gap-4">
                <h1 className="font-concent text-3xl lg:text-6xl underline whitespace-nowrap">
                  Pack Details
                </h1>

                <div className="flex flex-col gap-2 text-xl font-libertinus mt-4 text-center">
                  <p>
                    <span className="font-bold">Album:</span>{" "}
                    {selectedPack.album}
                  </p>
                  <p>
                    <span className="font-bold">Artist:</span>{" "}
                    {selectedPack.artist}
                  </p>
                  {/* <p>
                    <span className="font-bold">Genre:</span>{" "}
                    {selectedPack.genre || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold">Release Date:</span>{" "}
                    {selectedPack.releaseDate || "Unknown"}
                  </p>
                  <p>
                    <span className="font-bold">Tracks:</span>{" "}
                    {selectedPack.tracks?.length || "N/A"}
                  </p> */}
                </div>
              </div>
            </DrawerDescription>

            <DrawerFooter>
              <DrawerClose>
                <div className="flex w-full justify-center">
                  <div
                    className="cursor-target border py-2 px-3 w-24 rounded bg-white hover:text-white hover:bg-black"
                    onClick={() => {
                      setSelectedPack(null);
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
  );
};

export default PacksPage;
