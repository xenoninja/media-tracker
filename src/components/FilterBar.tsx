import { useEffect, useRef, useState } from "react";

interface FilterBarProps {
	onFilterChange: (filters: {
		type?: "movie" | "tvshow" | "book";
		search?: string;
	}) => void;
	activeType?: string;
}

export function FilterBar({ onFilterChange, activeType }: FilterBarProps) {
	const [type, setType] = useState<string>(activeType ?? "all");
	const [search, setSearch] = useState("");
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();

	const types = [
		{ value: "all", label: "全部" },
		{ value: "movie", label: "🎬 电影" },
		{ value: "tvshow", label: "📺 剧集" },
		{ value: "book", label: "📖 书籍" },
	];

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			onFilterChange({
				type:
					type === "all" ? undefined : (type as "movie" | "tvshow" | "book"),
				search: search.trim() || undefined,
			});
		}, 300);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [type, search, onFilterChange]);

	return (
		<div className="filter-bar">
			<div className="filter-pills">
				{types.map((t) => (
					<button
						type="button"
						key={t.value}
						className={`filter-pill ${type === t.value ? "active" : ""}`}
						onClick={() => setType(t.value)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="filter-search-wrap">
				<span className="filter-search-icon">🔍</span>
				<input
					className="filter-search"
					type="text"
					placeholder="搜索标题..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>
		</div>
	);
}
