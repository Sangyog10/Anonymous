"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { Button } from "@react-email/components";

export const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="/" className="text-xl font-bold mb-4 md:mb-0">
          Anynomous
        </a>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <Button
              onClick={() => signOut()}
              className="w-full md:w-auto bg-slate-100 text-black"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            href="/signin"
            className="w-full md:w-auto bg-slate-100 text-black"
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};
