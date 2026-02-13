// src/types/global.d.ts
interface Window {
  ENV: {
    API_BASE_URL: string;
    APP_BASE_URL: string;
    NODE_ENV: "development" | "production";
  };
}
