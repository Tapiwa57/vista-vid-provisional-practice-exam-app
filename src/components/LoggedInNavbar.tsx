import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoggedInNavbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const name = user?.user_metadata?.name || "Driver";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="bg-[#F5F3F5] w-full text-[#1B264F] p-4 shadow">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/explore">
          <Image
            src="/image/Logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="cursor-pointer"
          />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>
      <div
      
        className={`${
          isOpen ? "flex" : "hidden"
        } flex-col mt-4 space-y-2 md:mt-0 md:space-y-0 md:flex md:flex-row md:items-center md:space-x-6 font-semibold`}
      >
                 {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2 hover:underline"
        >
          <div className=" bg-[#1B264F] text-white flex items-center justify-center font-bold">
            {initials}
          </div>
          <span>{name}</span>
        </Link>
      {/* Links container */}
        <Link href="/notes" className="hover:underline">
          Study Notes
        </Link>
        <Link href="/exam" className="hover:underline">
          Practice Exam
        </Link>
        <Link href="/results" className="hover:underline">
          Results
        </Link>
        {/* Logout button */}
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full md:w-auto text-center"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
