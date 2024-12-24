import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "../providers";
import UserProvider from "../context/UserProvider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "../context/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function AuthLayout({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  // console.log(props)
  // console.log(cookies().get("Authorization"), 'user auth hun mein ')

  // const res = await fetch("http://127.0.0.1:4000/api/user/check-auth", {
  //   headers: { token: cookies().get("Authorization")?.value },
  // });

  // const isAuthenticated = res.ok;

  // if (isAuthenticated) {
  //   // redirect("/chat")
  // } else {
  //   // redirect("/auht/login")
  // }

  return (
    <ThemeProvider>
      <html lang="en" className="">
        <body className={inter.className}>
          <main>
            <UserProvider>{children}</UserProvider>
          </main>
        </body>
      </html>
    </ThemeProvider>
  );
}