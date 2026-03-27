import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { FilterBar } from "../components/FilterBar";
import { MediaCard } from "../components/MediaCard";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/board")({ component: Board });

type StatusColumn = "watching" | "completed" | "planned";

const COLUMN_CONFIG: {
	status: StatusColumn;
	label: string;
	icon: string;
}[] = [
	{ status: "watching", label: "在看", icon: "👀" },
	{ status: "completed", label: "已完成", icon: "✅" },
	{ status: "planned", label: "想看", icon: "📌" },
];

function Board() {
	const [filters, setFilters] = useState<{
		type?: "movie" | "tvshow" | "book";
		search?: string;
	}>({});
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

	const watchingItems = useQuery(api.media.list, {
		status: "watching",
		...filters,
	});
	const completedItems = useQuery(api.media.list, {
		status: "completed",
		...filters,
	});
	const plannedItems = useQuery(api.media.list, {
		status: "planned",
		...filters,
	});
	const updateStatusMutation = useMutation(api.media.updateStatus);
	const { showToast } = useToast();

	const getColumnItems = (status: StatusColumn) => {
		switch (status) {
			case "watching":
				return watchingItems;
			case "completed":
				return completedItems;
			case "planned":
				return plannedItems;
		}
	};

	const handleFilterChange = useCallback(
		(f: { type?: "movie" | "tvshow" | "book"; search?: string }) => {
			setFilters(f);
		},
		[],
	);

	const handleDragOver = (e: React.DragEvent, status: string) => {
		e.preventDefault();
		setDragOverColumn(status);
	};

	const handleDragLeave = () => {
		setDragOverColumn(null);
	};

	const handleDrop = async (e: React.DragEvent, newStatus: StatusColumn) => {
		e.preventDefault();
		setDragOverColumn(null);
		const mediaId = e.dataTransfer.getData("mediaId");
		if (!mediaId) return;

		try {
			await updateStatusMutation({
				id: mediaId as Id<"media">,
				status: newStatus,
			});
			showToast("success", "状态已更新");
		} catch {
			showToast("error", "更新失败");
		}
	};

	return (
		<main className="page-container fade-in">
			<h1 className="page-title">看板</h1>

			<FilterBar
				onFilterChange={handleFilterChange}
				activeType={filters.type}
			/>

			<div className="board-columns">
				{COLUMN_CONFIG.map(({ status, label, icon }) => {
					const items = getColumnItems(status);
					return (
						<div
							key={status}
							className={`board-column ${dragOverColumn === status ? "drag-over" : ""}`}
							onDragOver={(e) => handleDragOver(e, status)}
							onDragLeave={handleDragLeave}
							onDrop={(e) => handleDrop(e, status)}
						>
							<div className="board-column-header">
								<div className="board-column-title">
									<span>{icon}</span>
									<span>{label}</span>
								</div>
								<span className="board-column-count">{items?.length ?? 0}</span>
							</div>
							<div className="board-column-body">
								{items === undefined ? (
									<div className="empty-state">
										<p className="empty-state-text">加载中...</p>
									</div>
								) : items.length === 0 ? (
									<div className="empty-state">
										<p className="empty-state-text">
											还没有内容，拖拽卡片到这里
										</p>
									</div>
								) : (
									items.map((entry) => (
										<MediaCard key={entry._id} entry={entry} variant="board" />
									))
								)}
							</div>
						</div>
					);
				})}
			</div>
		</main>
	);
}
