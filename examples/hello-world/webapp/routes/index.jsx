import React from "react";

export const layout = "HeaderFooter";

export default function Page() {
  return (
    <div>
      <h1>hello</h1>
      <menu>
        <li>
          <a href="/about">/about</a>
        </li>
        <li>
          <a href="/status">/status</a>
        </li>
        <li>
          <a href="/users/pradeep">/users/pradeep</a>
        </li>
      </menu>
    </div>
  );
}
