import type { Metadata } from "next";
import '../global.css';

export const metadata: Metadata = {
  title: "Meetup chat",
  description: "Chatting app to meet people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        {children}
      </body>
    </html>
  );
}
