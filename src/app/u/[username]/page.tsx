"use client";
import { useParams } from "next/navigation";

const page = () => {
  const params = useParams();
  const { username } = params;

  return <div>Hello {username}</div>;
};

export default page;
