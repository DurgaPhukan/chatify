import type { Metadata } from "next";
import './global.css';

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
        {children}
      </body>
    </html>
  );
}
