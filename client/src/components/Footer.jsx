import React from "react";

const Footer = () => {
  return (
    <div className="flex w-screen fixed bottom-0 left-0 text-center justify-center text-xs">
      copyright &#169; {new Date().getFullYear()}
    </div>
  );
};

export default Footer;
