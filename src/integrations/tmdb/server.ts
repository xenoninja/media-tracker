import { createServerFn } from "@tanstack/react-start";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDBSearchResult {
	id: number;
	title: string;
	coverUrl?: string;
	year?: string;
}

function getApiKey(): string {
	const key = process.env.TMDB_API_KEY;
	if (!key) {
		throw new Error("TMDB_API_KEY is not set in environment variables");
	}
	return key;
}

export const searchTMDB = createServerFn({ method: "GET" })
	.inputValidator(
		(data: { query: string; type: "movie" | "tv" }): { query: string; type: "movie" | "tv" } => {
			if (!data.query || typeof data.query !== "string") {
				throw new Error("query is required");
			}
			if (data.type !== "movie" && data.type !== "tv") {
				throw new Error("type must be movie or tv");
			}
			return data;
		},
	)
	.handler(async ({ data }): Promise<TMDBSearchResult[]> => {
		const apiKey = getApiKey();
		const url = new URL(`${TMDB_BASE}/search/${data.type}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("query", data.query.trim());
		url.searchParams.set("language", "zh-CN");
		url.searchParams.set("include_adult", "false");
		url.searchParams.set("page", "1");

		const res = await fetch(url.toString());
		if (!res.ok) {
			throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
		}

		const json = (await res.json()) as {
			results: Array<{
				id: number;
				title?: string;
				name?: string;
				poster_path?: string | null;
				release_date?: string;
				first_air_date?: string;
			}>;
		};

		return json.results.map((item) => ({
			id: item.id,
			title: (data.type === "movie" ? item.title : item.name) || "未知标题",
			coverUrl: item.poster_path ? `${IMG_BASE}${item.poster_path}` : undefined,
			year: (data.type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4),
		}));
	});

export const getTMDBDetails = createServerFn({ method: "GET" })
	.inputValidator(
		(data: { id: number; type: "movie" | "tv" }): { id: number; type: "movie" | "tv" } => {
			if (typeof data.id !== "number") {
				throw new Error("id is required");
			}
			if (data.type !== "movie" && data.type !== "tv") {
				throw new Error("type must be movie or tv");
			}
			return data;
		},
	)
	.handler(async ({ data }): Promise<TMDBSearchResult> => {
		const apiKey = getApiKey();
		const url = new URL(`${TMDB_BASE}/${data.type}/${data.id}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "zh-CN");

		const res = await fetch(url.toString());
		if (!res.ok) {
			throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
		}

		const item = (await res.json()) as {
			id: number;
			title?: string;
			name?: string;
			poster_path?: string | null;
			release_date?: string;
			first_air_date?: string;
		};

		return {
			id: item.id,
			title: (data.type === "movie" ? item.title : item.name) || "未知标题",
			coverUrl: item.poster_path ? `${IMG_BASE}${item.poster_path}` : undefined,
			year: (data.type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4),
		};
	});
