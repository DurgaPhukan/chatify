import type { Metadata } from "next";
import '../global.css';
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Chatify",
  description: "Connect, Communicate, Collaborate!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="pt-[3.85rem]">
          {children}
        </div>
      </body>
    </html>
  );
}
