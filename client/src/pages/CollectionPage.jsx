import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { fetchUserAlbums } from "../api/spotify"; // ✅ new api helper
import { auth } from "../firebase";
import LiquidChrome from "../components/ui/LiquidChrome";
import Iridescence from "../components/ui/Iridescence";
import Dither from "../components/ui/Dither";
import Silk from "../components/ui/Silk";
import { FastAverageColor } from "fast-average-color";
import { useUser } from "../utils/userContext";

export default function CollectionPage({ page }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  // fetch cards with page + limit
  const fetchCards = async (pageNum = 1) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await fetchUserAlbums(currentUser.uid, pageNum, 9);
      console.log("Fetched user albums:", data); // 👈 check here
      setCards(Array.isArray(data.cards) ? data.cards : []);
      setPagination(data.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("Failed to load collection:", err);
      setCards([]); // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === "collection" && user) {
      fetchCards(1);
    }
  }, [page, user]);

  /** Card component handles its own background color */
  const InnerCard = React.memo(({ card }) => {
    const imgRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [colors, setColors] = useState({
      bgColor: "black",
      textColor: "white",
    });
    const [shaderColors, setShaderColors] = useState({
      waveColor: [0.5, 0.5, 0.5],
      baseColor: [0.1, 0.1, 0.1],
    });

    const handleImageLoad = async () => {
      try {
        const fac = new FastAverageColor();
        const color = await fac.getColorAsync(imgRef.current);

        setColors({
          bgColor: color.rgb,
          textColor: color.isDark ? "white" : "black",
        });

        if (Array.isArray(color.value)) {
          const [r, g, b] = color.value;
          const normalized = [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255];
          setShaderColors({
            waveColor: normalized,
            baseColor: normalized,
          });
        }

        setImageLoaded(true); // ✅ shader backgrounds mount only after this
      } catch (e) {
        console.error("Color extraction failed:", e);
      }
    };

    const background = useMemo(() => {
      if (!imageLoaded) return null; // ✅ skip heavy shaders until image ready

      switch (card?.border) {
        case 2:
          return (
            <LiquidChrome
              baseColor={shaderColors.waveColor}
              speed={0.5}
              amplitude={0.4}
              interactive={false}
            />
          );
        case 3:
          return (
            <Iridescence
              color={shaderColors.waveColor}
              mouseReact={false}
              amplitude={0.08}
              speed={0.6}
            />
          );
        case 4:
          return (
            <Dither
              waveColor={shaderColors.waveColor}
              disableAnimation={false}
              enableMouseInteraction={false}
              waveAmplitude={0.2}
              waveFrequency={2}
              waveSpeed={0.02}
            />
          );
        case 5:
          return (
            <Silk speed={3} scale={1} color="#7B7481" noiseIntensity={1.0} />
          );
        default:
          return null;
      }
    }, [card?.border, shaderColors, imageLoaded]);

    return (
      <div className="relative h-[390px] w-[290px] rounded-lg shadow-md overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {background}
        </div>

        <div
          className="relative z-10 m-[10px] h-[370px] w-[270px] rounded-lg flex flex-col items-center justify-center"
          style={{
            backgroundColor: colors.bgColor,
            color: colors.textColor,
          }}
        >
          <div className="flex h-[200px] w-[200px]">
            <img
              ref={imgRef}
              src={card?.album?.images?.[0]?.url}
              alt={card?.album?.name || "Album cover"}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
          </div>

          <div className="flex flex-col w-full px-10 py-2 font-libertinus">
            <div className="font-concent text-2xl line-clamp-2">
              {card?.track?.name}
            </div>
            <div className="font-semibold">{card?.album?.name}</div>
            <div className="font-semibold">
              {card?.album?.artists?.map((a) => a.name).join(", ")}
            </div>
          </div>
        </div>
      </div>
    );
  });

  const handlePageChange = (newPage) => {
    if (newPage !== pagination.currentPage) {
      fetchCards(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center bg-transparent relative z-20">
      <h1 className="text-6xl font-concent mb-4">Collection</h1>
      <div className="flex-1 w-f overflow-auto">
        {user ? (
          <>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {Array.isArray(cards) && cards.length > 0 ? (
                    cards.map((card, i) => <InnerCard key={i} card={card} />)
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
