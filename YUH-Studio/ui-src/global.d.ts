import type { H3Api } from "./types";

declare global {
  interface Window {
    h3: H3Api;
  }
}

export {};
