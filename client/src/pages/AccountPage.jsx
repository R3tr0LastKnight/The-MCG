import React, { useEffect, useState } from "react";
import { useUser } from "../utils/userContext";
import { auth } from "../firebase";
import { fetchUserSummary } from "../api/spotify";
import CardReRender from "../components/CardRerenderer";
import { Progress } from "../components/ui/Progress.tsx";

const AccountPage = () => {
  const { user, logOut } = useUser();
  const [userSummary, setUserSummary] = useState(null);
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const data = await fetchUserSummary(uid);
        console.log("User Data:", data);

        const latestCard = data?.latestCard;
        const spotify = latestCard?.spotify; // ✅ define first

        // 🎯 Format cardData for <CardReRender />
        const formatted = {
          data: {
            border: latestCard?.border ?? 1,
            bgSubId: latestCard?.bgSubId ?? 2,
            effectId: latestCard?.effectId ?? 1,
          },
          track: {
            album: {
              image: spotify?.album?.image ?? "",
              name: spotify?.album?.name ?? "Unknown Album",
              artist: spotify?.album?.artist ?? "Unknown Artist",
            },
            track: {
              name: spotify?.track?.name ?? "Unknown Track",
            },
          },
        };

        setCardData(formatted);
        setUserSummary(data);
      } catch (err) {
        console.error("Error loading user summary:", err);
      }
    };

    loadSummary();
  }, []);

  if (!userSummary) return <p>Loading...</p>;

  const { name, email, photo, level } = userSummary;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 mx-5 mt-12 relative z-20">
      <div className="flex flex-col lg:flex-row lg:items-start  lg:w-2/3">
        <div className="flex flex-col lg:flex-row lg:w-full gap-5 mb-5 lg:justify-end">
          <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white w-full lg:w-[60%] p-4">
            <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white text-black py-2 px-2 flex gap-2 text-xl text-center justify-center lg:mt-4">
              {userSummary.cardCount} cards in collection
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-6">
              <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-green-200 text-black py-2 px-2 flex gap-2 text-lg text-center justify-center w-full">
                Common : 44
              </div>
              <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-blue-200 text-black py-2 px-2 flex gap-2 text-lg text-center justify-center w-full">
                Rare : 12
              </div>
              <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-purple-200 text-black py-2 px-2 flex gap-2 text-lg text-center justify-center w-full">
                Epic : 5
              </div>
              <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-yellow-200 text-black py-2 px-2 flex gap-2 text-lg text-center justify-center w-full">
                Legendary : 2
              </div>
            </div>
            <div className="flex flex-col w-full mt-8 ">
              <div className="flex  gap-2 flex-col">
                <div>
                  lvl {user.level} | {userSummary.exp} / 1000
                </div>
                <div className="w-full">
                  <Progress
                    value={user.exp / 10}
                    className="bg-white border [&>div]:bg-black transition-all duration-1000 ease-out"
                  />
                </div>
              </div>
            </div>
            <div className="flex shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-full p-2 mt-6  py-20 justify-center rounded">
              work in progress....
            </div>
          </div>

          <div>
            <h1 className="font-semibold mb-2">Latest Card</h1>
            <div className="cursor-target">
              {cardData && <CardReRender cardData={cardData} />}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white min-h-[200px]">
          <div className="p-6 flex flex-col justify-center items-center">
            <img
              src={photo}
              alt={name}
              className="h-60 w-60 rounded-full mb-4"
              referrerPolicy="no-referrer"
            />
            <p className="text-3xl font-semibold">{name}</p>
            <p>{email}</p>

            <div
              onClick={logOut}
              className="cursor-target border py-2 px-3 w-24 rounded bg-white hover:text-white hover:bg-black text-center font-bold mt-3"
            >
              Log Out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
