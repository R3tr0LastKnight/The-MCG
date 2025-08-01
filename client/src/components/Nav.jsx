import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu.tsx";

const Nav = () => {
  return (
    <div className="flex items-center justify-between w-screen px-4  !lg:max-h-[10vh] py-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <div className="text-5xl font- font-bitcount">The MCG</div>
      <div className="flex flex-col lg:flex-row lg:mr-4 items-center gap-4 ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>

        <div className="flex flex-col text-sm">
          <div>R3tr0LastKnight</div>
          <div className="flex gap-2">
            <div>lvl 14</div>
            <div>---------</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
