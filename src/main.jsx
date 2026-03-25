import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { seedProductsIfEmpty } from "./lib/seedStorage";
import { ensureDefaultAdmin } from "./lib/authBootstrap";

async function bootstrap() {
  await seedProductsIfEmpty();
  ensureDefaultAdmin();
}

bootstrap().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
});
