import React, { useEffect } from "react";
import { auth } from "../firebase";
import { fetchLeaderboardWithRank } from "../api/spotify";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [userRank, setUserRank] = React.useState(null);
  const [totalPlayers, setTotalPlayers] = React.useState(0);
  const [userCardData, setUserCardData] = React.useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const uid = auth.currentUser?.uid;

        if (!uid) {
          // Guest mode → only fetch top 10 without rank
          try {
            const data = await fetchLeaderboardWithRank("guest"); // backend will ignore rank if guest
            setLeaderboard(data.leaderboard);
            setTotalPlayers(data.totalPlayers);
          } catch (err) {
            console.error("Guest leaderboard fetch error:", err);
          }
          return;
        }

        // Logged-in user → full data with rank
        const data = await fetchLeaderboardWithRank(uid);
        setLeaderboard(data.leaderboard);
        setUserRank(data.rank);
        setTotalPlayers(data.totalPlayers);
        setUserCardData(data.user);
        console.log(data);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="lg:w-[80%] w-[100%] mx-auto p-6 mb-6">
      <h2 className="text-6xl mb-4 text-center font-bitcount cursor-target w-fit mx-auto">
        Leaderboard
      </h2>

      <div className="rounded-2xl border  shadow-[0_3px_10px_rgb(0,0,0,0.2)] mb-4 bg-white text-black backdrop-blur-md w-full overflow-hidden">
        <Table className="w-full text-base">
          <TableCaption className="text-sm text-center ">
            League of Champions
          </TableCaption>

          <TableHeader>
            <TableRow className="bg-white/10 border-b border-white/10">
              <TableHead className="w-[80px] ">Rank</TableHead>
              <TableHead className="">Player</TableHead>
              <TableHead className="text-right ">Cards</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leaderboard?.map((user, i) => {
              return (
                <TableRow
                  key={user.uid}
                  className="hover:bg-white/10 transition"
                >
                  <TableCell className="font-semibold ">{`#${
                    i + 1
                  }`}</TableCell>

                  <TableCell className="flex items-center gap-3 py-2">
                    <img
                      src={user.photo}
                      alt="x"
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                      onError={(e) => (e.target.src = "/default-avatar.png")}
                      referrerPolicy="no-referrer"
                    />
                    <span className="">{user.name}</span>
                  </TableCell>

                  <TableCell className="text-right font-semibold ">
                    {user.cardCount}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Logged-in user */}
            {auth.currentUser && userCardData && (
              <TableRow className="bg-yellow-500/15 border-t border-yellow-300/40 shadow-inner">
                <TableCell className="font-bold text-yellow-300">
                  #{userRank}
                </TableCell>

                <TableCell className="flex items-center gap-3 py-2">
                  <img
                    src={userCardData.photo}
                    alt="you"
                    className="w-10 h-10 rounded-full object-cover border border-yellow-300"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-semibold text-yellow-300">
                    {userCardData.name} (You)
                  </span>
                </TableCell>

                <TableCell className="text-right font-bold text-yellow-300">
                  {userCardData.cardCount}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow className="bg-white/5">
              <TableCell colSpan={2} className="">
                Total Players
              </TableCell>
              <TableCell className="text-right font-semibold ">
                {totalPlayers}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
