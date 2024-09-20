import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import servicesData from "./data/services";
import HealthServices from "./components/HealthServices";

const queryClient = new QueryClient();

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HealthServices />
      </QueryClientProvider>
    </>
  );
}

export default App;
