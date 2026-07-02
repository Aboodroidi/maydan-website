import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LangProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
