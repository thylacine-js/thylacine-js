import React from "react";
import { useParams } from "react-router-dom";

export const layout = "HeaderFooter";

export default function Page() {
  const { username } = useParams();
  return (
    <div>
      <h1>This is {username}'s page!</h1>
    </div>
  );
}
