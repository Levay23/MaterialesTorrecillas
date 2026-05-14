import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const base = import.meta.env.PROD ? "https://levayjorge21-erpmaterial.hf.space" : "http://localhost:3000";
setBaseUrl(base);

createRoot(document.getElementById("root")!).render(<App />);
