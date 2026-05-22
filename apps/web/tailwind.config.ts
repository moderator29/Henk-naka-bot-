import type { Config } from "tailwindcss";
import { auroraPreset } from "@aurora/design-system/tailwind-preset";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
  ],
  presets: [auroraPreset],
  plugins: [],
};

export default config;
