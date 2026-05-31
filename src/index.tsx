import { Suspense } from "react";

import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./assets/index.css";
import "./libs/DayjsSetting";
import { TooltipPrimitive } from "./components/Tooltip";

import ReduxRoutes from "./routes";
// import i18n (needs to be bundled ;))
import "./i18n";
import "./libs/polyfills";

import { isDarkMode } from "./utils";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
// dark mode
if (isDarkMode()) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
root.render(
  <Suspense fallback="loading">
    <TooltipPrimitive.Provider delayDuration={150}>
      <Toaster
        toastOptions={{
          className: "dark:!bg-gray-800 dark:!text-gray-50 wb"
        }}
      />
      <ReduxRoutes />
    </TooltipPrimitive.Provider>
  </Suspense>
);
