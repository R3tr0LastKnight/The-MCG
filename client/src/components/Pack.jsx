import React from "react";
import currents from "../assets/currents.png";

const Pack = () => {
  return (
    <>
      <div className="flex flex-col h-[400px] w-[300px] bg-black rounded-lg justify-center items-center gap-4">
        <div className="max-h-52 max-w-52 overflow-hidden">
          <img className="" src={currents} alt="" />
        </div>
        <div className="flex flex-col text-center">
          <h1 className="text-5xl font-concent">Tame Impala</h1>
          <h2 className="text-lg font-libertinus">Pack</h2>
        </div>
      </div>
    </>
  );
};

export default Pack;
