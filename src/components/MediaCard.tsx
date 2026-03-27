import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { MediaModal } from "./MediaModal";
import { useToast } from "./Toast";

interface MediaCardProps {
	entry: Doc<"media">;
	variant?: "card" | "board";
}

const TYPE_ICONS: Record<string, string> = {
	movie: "🎬",
	tvshow: "📺",
	book: "📖",
};

const TYPE_LABELS: Record<string, string> = {
	movie: "电影",
	tvshow: "剧集",
	book: "书籍",
};

const STATUS_LABELS: Record<string, string> = {
	watching: "在看",
	completed: "已完成",
	planned: "想看",
};

function StarDisplay({ rating }: { rating: number }) {
	const stars = [];
	const fullStars = Math.floor(rating / 2);
	const halfStar = rating % 2 >= 1;
	for (let i = 0; i < 5; i++) {
		if (i < fullStars) {
			stars.push("★");
		} else if (i === fullStars && halfStar) {
			stars.push("☆");
		} else {
			stars.push("☆");
		}
	}
	return <span className="media-card-rating">{stars.join("")}</span>;
}

export function MediaCard({ entry, variant = "card" }: MediaCardProps) {
	const [showEdit, setShowEdit] = useState(false);

	const removeMutation = useMutation(api.media.remove);
	const updateStatusMutation = useMutation(api.media.updateStatus);
	const { showToast } = useToast();

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await removeMutation({ id: entry._id });
			showToast("success", `已删除「${entry.title}」`);
		} catch {
			showToast("error", "删除失败");
		}
	};

	const handleStatusChange = async (
		e: React.MouseEvent,
		status: "watching" | "completed" | "planned",
	) => {
		e.stopPropagation();
		try {
			await updateStatusMutation({ id: entry._id, status });
			showToast("success", `已更新「${entry.title}」状态`);
		} catch {
			showToast("error", "更新失败");
		}
	};

	if (variant === "board") {
		return (
			<>
				<div
					className="board-card"
					role="button"
					tabIndex={0}
					draggable
					onDragStart={(e) => {
						e.dataTransfer.setData("mediaId", entry._id);
						(e.target as HTMLElement).classList.add("dragging");
					}}
					onDragEnd={(e) => {
						(e.target as HTMLElement).classList.remove("dragging");
					}}
					onClick={() => setShowEdit(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") setShowEdit(true);
					}}
				>
					<div className="board-card-cover">
						{entry.coverUrl ? (
							<img src={entry.coverUrl} alt={entry.title} />
						) : (
							<div className="board-card-placeholder-icon">
								{TYPE_ICONS[entry.type]}
							</div>
						)}
					</div>
					<div className="board-card-info">
						<div className="board-card-title">{entry.title}</div>
						<div className="board-card-meta">
							<span className="badge badge-type">
								{TYPE_ICONS[entry.type]} {TYPE_LABELS[entry.type]}
							</span>
							{entry.rating !== undefined && (
								<StarDisplay rating={entry.rating} />
							)}
						</div>
						{entry.progress && (
							<div className="media-card-progress">{entry.progress}</div>
						)}
					</div>
					<div className="board-card-actions">
						<button
							type="button"
							className="btn-icon"
							title="删除"
							onClick={handleDelete}
						>
							🗑
						</button>
					</div>
				</div>
				{showEdit && (
					<MediaModal entry={entry} onClose={() => setShowEdit(false)} />
				)}
			</>
		);
	}

	return (
		<>
			<div
				className="media-card"
				role="button"
				tabIndex={0}
				onClick={() => setShowEdit(true)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") setShowEdit(true);
				}}
			>
				<div className="media-card-actions">
					{entry.status !== "completed" && (
						<button
							type="button"
							className="btn-icon"
							title="标记已完成"
							onClick={(e) => handleStatusChange(e, "completed")}
						>
							✓
						</button>
					)}
					<button
						type="button"
						className="btn-icon"
						title="删除"
						onClick={handleDelete}
					>
						🗑
					</button>
				</div>
				<div className="media-card-cover">
					{entry.coverUrl ? (
						<img src={entry.coverUrl} alt={entry.title} />
					) : (
						<div className="media-card-placeholder">
							{TYPE_ICONS[entry.type]}
						</div>
					)}
				</div>
				<div className="media-card-body">
					<div className="media-card-title">{entry.title}</div>
					<div className="media-card-meta">
						<span className="badge badge-type">{TYPE_LABELS[entry.type]}</span>
						<span className={`badge badge-${entry.status}`}>
							{STATUS_LABELS[entry.status]}
						</span>
					</div>
					{entry.rating !== undefined && <StarDisplay rating={entry.rating} />}
					{entry.progress && (
						<div className="media-card-progress">{entry.progress}</div>
					)}
				</div>
			</div>
			{showEdit && (
				<MediaModal entry={entry} onClose={() => setShowEdit(false)} />
			)}
		</>
	);
}
