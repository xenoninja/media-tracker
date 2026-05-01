import { useEffect, useRef, useState } from "react";
import { searchTMDB } from "../integrations/tmdb/server";

export interface TMDBResult {
	id: number;
	title: string;
	coverUrl?: string;
}

interface TMDBSearchProps {
	query: string;
	type: "movie" | "tv";
	visible: boolean;
	onSelect: (result: TMDBResult) => void;
}

export function TMDBSearch({ query, type, visible, onSelect }: TMDBSearchProps) {
	const [results, setResults] = useState<
		Array<{ id: number; title: string; coverUrl?: string; year?: string }>
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		if (!visible || query.trim().length < 2) {
			setResults([]);
			setError(null);
			return;
		}

		if (debounceRef.current) clearTimeout(debounceRef.current);
		setLoading(true);
		setError(null);

		debounceRef.current = setTimeout(async () => {
			try {
				const data = await searchTMDB({ data: { query: query.trim(), type } });
				setResults(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "搜索失败");
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, 400);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, type, visible]);

	if (!visible) return null;

	return (
		<div className="tmdb-search-panel">
			{loading && (
				<div className="tmdb-search-loading">
					<div className="tmdb-skeleton-row">
						<div className="tmdb-skeleton-poster" />
						<div className="tmdb-skeleton-text" />
					</div>
					<div className="tmdb-skeleton-row">
						<div className="tmdb-skeleton-poster" />
						<div className="tmdb-skeleton-text" />
					</div>
					<div className="tmdb-skeleton-row">
						<div className="tmdb-skeleton-poster" />
						<div className="tmdb-skeleton-text" />
					</div>
				</div>
			)}

			{error && (
				<div className="tmdb-search-empty">
					<p className="tmdb-search-empty-text">❌ {error}</p>
					<p className="tmdb-search-empty-sub">你可以手动输入信息</p>
				</div>
			)}

			{!loading && !error && results.length === 0 && query.trim().length >= 2 && (
				<div className="tmdb-search-empty">
					<p className="tmdb-search-empty-text">未找到相关结果</p>
					<p className="tmdb-search-empty-sub">你可以手动输入信息</p>
				</div>
			)}

			{!loading && !error && results.length > 0 && (
				<div className="tmdb-search-results">
					{results.map((item) => (
						<button
							type="button"
							key={item.id}
							className="tmdb-result-card"
							onClick={() =>
								onSelect({
									id: item.id,
									title: item.title,
									coverUrl: item.coverUrl,
								})
							}
						>
							<div className="tmdb-result-poster">
								{item.coverUrl ? (
									<img
										src={item.coverUrl}
										alt={item.title}
										loading="lazy"
									/>
								) : (
									<div className="tmdb-result-placeholder">
										{type === "movie" ? "🎬" : "📺"}
									</div>
								)}
							</div>
							<div className="tmdb-result-meta">
								<div className="tmdb-result-title">{item.title}</div>
								{item.year && (
									<div className="tmdb-result-year">{item.year}</div>
								)}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
