import React, { useEffect, useRef, useState } from "react";
import currrents from "../assets/currents.png";
import { FastAverageColor } from "fast-average-color";

const PackOpening = (pack) => {
  const [colors, setColors] = useState({
    bgColor: "black",
    textColor: "white",
  });
  const imgRef = useRef(null);

  // Function to randomize border + effects with weighted chances
  const CardRandomization = () => {
    const borderColors = [
      { class: "bg-yellow-400", chance: 10 }, // gold
      { class: "bg-gray-300", chance: 10 }, // silver
      { class: "bg-black ", chance: 10 }, // black border + white bg inside
      { class: "bg-white", chance: 10 }, // white
      { class: "bg-gray-500", chance: 10 }, // default/basic
      { class: "holo-effect", chance: 100 }, // dynamic holo
      {
        class: "bg-gradient-to-tr from-gray-200 via-gray-50 to-gray-400",
        chance: 10,
      }, // metal?
      {
        class:
          "bg-[conic-gradient(at_top_left,_#ff00ff,_#00ffff,_#ffff00,_#ff00ff)]",
        chance: 10,
      }, //Rainbow Holo Border
      {
        class:
          "bg-[linear-gradient(135deg,_#ff9ff3,_#feca57,_#48dbfb,_#1dd1a1,_#5f27cd,_#ff9ff3)] bg-[length:200%_200%] animate-gradient",
        chance: 10,
      }, //Iridescent Holo Glow
    ];

    const effects = [
      { class: "", chance: 33 }, // basic
      { class: "shiny-effect", chance: 33 }, // shiny
      // { class: "sparkle-effect", chance: 0 }, // sparkle
      { class: "negative-effect", chance: 33 }, // negative
    ];

    const pickRandomWeighted = (list) => {
      const total = list.reduce((sum, item) => sum + item.chance, 0);
      let rand = Math.random() * total;
      for (let item of list) {
        if (rand < item.chance) return item.class;
        rand -= item.chance;
      }
      return list[list.length - 1].class;
    };

    return {
      borderClass: pickRandomWeighted(borderColors),
      effectClass: pickRandomWeighted(effects),
    };
  };

  // State for styles
  const [{ borderClass, effectClass }, setStyles] = useState(CardRandomization);

  const changeEffect = () => {
    setStyles(CardRandomization());
  };

  return (
    <>
      <button
        onClick={changeEffect}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 z-10 absolute  left-4 "
      >
        Change Effect
      </button>
      <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-4">
        {/* Card */}

        <div
          className={`flex flex-col h-[390px] w-[290px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute border-4 ${borderClass} ${effectClass}`}
        >
          <div
            className="flex flex-col pt-8 items-center h-[370px] w-[270px] bg-black text-white rounded-lg relative"
            style={{
              backgroundColor: colors.bgColor || "black",
              color: colors.textColor || "white",
            }}
          >
            <div className="flex absolute top-1 left-1">
              {/* heart icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="size-6"
              >
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            </div>
            <div className="flex gap-1 absolute top-1 right-2">
              {/* flame icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
                  clipRule="evenodd"
                />
              </svg>
              77
            </div>
            <div className="flex h-[200px] w-[200px]">
              <img
                ref={imgRef}
                src={currrents}
                alt="Currents"
                onLoad={() => {
                  const fac = new FastAverageColor();
                  const color = fac.getColor(imgRef.current);
                  setColors({
                    bgColor: color.rgb,
                    textColor: color.isDark ? "white" : "black",
                  });
                }}
              />
            </div>
            <div className="flex flex-col w-full px-10 py-2 font-libertinus">
              <div className="font-concent text-2xl">Yes I'm Changing</div>
              <div className="font-semibold">Currents</div>
              <div className="font-semibold">Tame Impala</div>
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1">
                  {/* clock icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  05 : 05
                </div>
                <div className="flex items-center gap-1">
                  {/* calendar icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-4"
                  >
                    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  04 - 20 - 2015
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackOpening;
