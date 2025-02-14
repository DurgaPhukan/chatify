"use client";
import React from "react";
import CreateBroadcast from "./components/CreateBroadcast";
import { QueryProvider } from "@/app/components/QueryProvider";

const Create = () => {
  return (
    <QueryProvider>
      <div className="mt-[8rem] flex justify-center items-center">
        <CreateBroadcast />
      </div>
    </QueryProvider>
  );
};

export default Create;
