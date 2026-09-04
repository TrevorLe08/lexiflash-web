import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    try {
      localStorage.removeItem("lexiflash_theme");
    } catch {
      // ignore
    }
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
