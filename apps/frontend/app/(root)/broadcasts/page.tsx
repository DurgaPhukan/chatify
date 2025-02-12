import { QueryProvider } from "@/app/components/QueryProvider";
import React from "react";
import BroadcastList from "./components/BroadcastList";


const BroadcastsPage: React.FC = () => {
  return (
    <div>
      <QueryProvider>
        <BroadcastList />
      </QueryProvider>
    </div>
  );
};

export default BroadcastsPage;
