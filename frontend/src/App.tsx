import { Route, Routes } from "react-router";
import { Page } from "./Page";
import { Side } from "./Side";

export function App() {
  return (
    <div className="h-screen w-screen grid grid-cols-[auto_1fr]">
      <Side />
      <Routes>
        <Route path="*" element={<Page />} />
      </Routes>
    </div>
  );
}
