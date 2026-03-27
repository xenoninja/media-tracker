import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
