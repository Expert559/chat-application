import Sidebar from "@/components/SideBar";
import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "../providers";
import UserProvider, { UserContext } from "../context/UserProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "../context/ThemeProvider";
import {   MessageCircleIcon } from "lucide-react";
import Link from "next/link";
export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserProvider>
            <div className="flex flex-col min-h-[100dvh]">
              <header className="px-4 fixed w-full top-0 z-10 bg-white shadow-md lg:px-6 h-14 flex items-center">
                <Link
                  className="flex items-center justify-center gap-2"
                  href="#"
                >
                  <MessageCircleIcon className="text-gray-700 " />

                  <span className=" font-semibold">i Chat</span>
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                  <Link
                    className="text-sm font-medium hover:underline underline-offset-4"
                    href="/"
                  >
                    Home
                  </Link>
                  <Link
                    className="text-sm font-medium hover:underline underline-offset-4"
                    href="/auth/register"
                  >
                    Register
                  </Link>
                </nav>
              </header>
              {children}
            </div>
          </UserProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}