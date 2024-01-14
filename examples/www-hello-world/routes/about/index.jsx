import React from "react";
import { defer, useLoaderData, Await } from "react-router-dom";

export const layout = "HeaderFooter";

export async function loader() {
  const data = new Promise((resolve) => {
    setTimeout(() => {
      resolve("hello");
    }, 3000);
  });
  return defer({ data });
}

export default function Page() {
  const { data } = useLoaderData();

  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <Await resolve={data} errorElement={<div>error!</div>}>
        <>done!</>
      </Await>
    </React.Suspense>
  );
}
