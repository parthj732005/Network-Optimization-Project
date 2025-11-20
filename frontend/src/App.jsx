import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizePage from "./pages/OptimizePage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OptimizePage />
    </QueryClientProvider>
  );
}
