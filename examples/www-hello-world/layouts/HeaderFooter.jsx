import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function HeaderFooter() {
  return (
    <div className="HeaderFooter Layout">
      <header>
        <div className="left"></div>
        <div className="center">
          <Link to={"/"}>www.hello.world</Link>
        </div>
        <div className="right"></div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  );
}
