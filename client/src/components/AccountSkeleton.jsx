import React from "react";

const AccountSkeleton = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 mx-5 mt-12 animate-pulse">
      {/* Left Section */}
      <div className="flex flex-col lg:flex-row lg:w-2/3 gap-5">
        <div className="rounded-lg bg-white w-full lg:w-[60%] h-[400px] p-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] lg:ml-32">
          {/* Cards Count */}
          <div className="h-10 bg-gray-200 rounded mb-6"></div>

          {/* Rarity boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Level / Progress */}
          <div className="mt-8 space-y-2">
            <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
            <div className="h-4 bg-gray-300 w-full rounded"></div>
          </div>

          {/* Work in progress box */}
          <div className="h-32 bg-gray-200 w-full mt-6 rounded"></div>
        </div>

        {/* Latest Card Skeleton */}
        <div>
          <div className="h-6 bg-gray-200 w-32 rounded mb-2"></div>
          <div className="h-[350px] w-[240px] bg-gray-300 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)]"></div>
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/3">
        <div className="rounded-lg bg-white min-h-[200px] p-6 flex flex-col items-center shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <div className="h-60 w-60 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 w-40 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 w-52 rounded"></div>
          <div className="h-10 w-24 bg-gray-300 rounded mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default AccountSkeleton;
