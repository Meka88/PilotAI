import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { tryLoadAndStartRecorder } from "@alwaysmeticulous/recorder-loader";
import App from "./App";
import { AppProvider } from "@/lib/store";
import "@/styles/global.css";

async function main() {
  const recordingToken = import.meta.env.VITE_METICULOUS_RECORDING_TOKEN as
    | string
    | undefined;
  if (recordingToken) {
    await tryLoadAndStartRecorder({ recordingToken });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

main().catch(console.error);
