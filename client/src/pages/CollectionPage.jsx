import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { fetchUserEnrichedCards } from "../api/spotify";
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
  const { user, setUser } = useUser();

  useEffect(() => {
    if (page !== "collection") return;

    const fetchCards = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        setLoading(true);
        const enriched = await fetchUserEnrichedCards(user.uid);
        setCards(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [page]);

  /** Card component handles its own background color */
  const InnerCard = ({ card }) => {
    const imgRef = useRef(null);
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
      } catch (e) {
        console.error("Color extraction failed:", e);
      }
    };

    const background = useMemo(() => {
      switch (card?.border) {
        case 2:
          return (
            <LiquidChrome
              baseColor={shaderColors.waveColor}
              speed={1}
              amplitude={0.6}
              interactive={false}
            />
          );
        case 3:
          return (
            <Iridescence
              color={shaderColors.waveColor}
              mouseReact={false}
              amplitude={0.1}
              speed={1.0}
            />
          );
        case 4:
          return (
            <Dither
              waveColor={shaderColors.waveColor}
              disableAnimation={false}
              enableMouseInteraction={false}
              mouseRadius={0.3}
              colorNum={4}
              waveAmplitude={0.3}
              waveFrequency={3}
              waveSpeed={0.05}
            />
          );
        case 5:
          return (
            <Silk
              speed={5}
              scale={1}
              color="#7B7481"
              noiseIntensity={1.5}
              rotation={0}
            />
          );
        default:
          return null;
      }
    }, [card?.border, shaderColors]);

    return (
      <div className="relative h-[390px] w-[290px] rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Suspense fallback={null}>{background}</Suspense>
        </div>

        <div
          className="relative z-10 m-[10px] h-[370px] w-[270px] rounded-lg flex flex-col items-center justify-center"
          style={{
            backgroundColor: colors.bgColor,
            color: colors.textColor,
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full w-full text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              <p className="mt-4">Loading track...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full lg:px-16 justify-center items-center bg-transparent">
      <h1 className="text-6xl font-concent mb-4">Collection</h1>
      <div className="flex-1 w-f overflow-auto">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
            {cards.map((card, i) => (
              <InnerCard key={i} card={card} />
            ))}
          </div>
        ) : (
          <>Login to view your collection</>
        )}
      </div>
    </div>
  );
}
