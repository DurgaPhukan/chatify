import Header from "../components/Header";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="pt-[3.85rem]">
      <Header />
      {children}
    </div>
  );
}
