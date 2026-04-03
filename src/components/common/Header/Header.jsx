import React from "react";
import "./Header.css";
import Logo from "../Logo";

const Header = () => {
  return (
    <header className="app-header">
      <Logo size={32} showText={true} />
    </header>
  );
};

export default Header;
