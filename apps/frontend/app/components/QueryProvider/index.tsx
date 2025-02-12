"use client"
import BroadcastsPage from "@/app/(root)/broadcasts/page";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
