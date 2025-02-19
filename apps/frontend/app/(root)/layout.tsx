import { SocketContextProvider } from "../components/Context/ContextProvider";
import Header from "../components/Header";
import SocketConnectionWrapper from "./components/SocketConnectionWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketContextProvider>
      <SocketConnectionWrapper>
        <div className="pt-[3.85rem]">
          <Header />
          {children}
        </div>
      </SocketConnectionWrapper>
    </SocketContextProvider>
  );
}