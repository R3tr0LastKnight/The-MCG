import React from "react";

const Footer = () => {
  return (
    <div className="flex w-screen bg-transparent fixed bottom-0 left-0 text-center justify-center text-xs -z-10">
      copyright &#169; {new Date().getFullYear()}
    </div>
  );
};

export default Footer;
