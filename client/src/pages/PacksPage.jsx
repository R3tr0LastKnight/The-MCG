import React, { useState, useEffect } from "react";
import { useUser } from "../utils/userContext";
import { fetchAllPacks } from "../api/spotify";
import { FastAverageColor } from "fast-average-color";

const PacksPage = () => {
  const { user } = useUser();
  const [packs, setPacks] = useState([]);
  const [colors, setColors] = useState({});
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);

  // 🟦 Fetch all packs
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

  // 🟩 Extract average colors from each pack cover
  useEffect(() => {
    if (!packs.length) return;
    const fac = new FastAverageColor();

    packs.forEach((pack, i) => {
      if (!pack?.cover) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pack.cover;
      img.onload = async () => {
        try {
          const color = await fac.getColorAsync(img);
          setColors((prev) => ({
            ...prev,
            [i]: {
              bgColor: color.rgb,
              textColor: color.isDark ? "white" : "black",
            },
          }));
        } catch (e) {
          console.error("Color extraction failed:", e);
        }
      };
    });
  }, [packs]);

  if (!user)
    return (
      <div className="flex h-full items-center justify-center text-xl">
        Login to view your packs
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center relative z-20">
      <h1 className="text-6xl font-concent mb-8">Packs</h1>

      <div className="flex-1 w-f overflow-auto justify-center ">
        {loading ? (
          <div className="text-lg text-gray-400 text-center">Loading...</div>
        ) : (
          <>
            {/* 🟨 Grid layout for packs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {packs.length > 0 ? (
                packs.map((pack, i) => {
                  const colorSet = colors[i] || {
                    bgColor: "rgb(30,30,30)",
                    textColor: "white",
                  };
                  return (
                    <div
                      key={i}
                      className="rounded-xl cursor-target transition-all duration-500 shadow-lg    flex flex-col justify-center items-center"
                      style={{
                        backgroundColor: colorSet.bgColor,
                        color: colorSet.textColor,
                        width: "300px",
                        height: "420px",
                      }}
                    >
                      <div className="flex flex-col justify-center items-center gap-4 p-4 relative">
                        <div className="h-52 w-52 overflow-hidden rounded-md shadow-md">
                          <img
                            src={pack?.cover}
                            alt={`${pack.album} cover`}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex flex-col text-center">
                          <h1 className="text-3xl font-concent px-2">
                            {pack?.album}
                          </h1>
                          <h2 className="text-lg font-libertinus">
                            {pack?.artist}
                          </h2>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No packs found</div>
              )}
            </div>

            {/* 🟦 Pagination */}
            <div className="grid grid-cols-5 lg:grid-cols-10 justify-center mt-4 gap-2 text-center">
              {Array.from({ length: pagination.totalPages }, (_, idx) => (
                <div
                  key={idx + 1}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`px-3 py-1 rounded-md transition-all duration-300 cursor-target   ${
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
  );
};

export default PacksPage;
