import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { useToast } from "./Toast";
import { TMDBSearch } from "./TMDBSearch";

interface MediaModalProps {
	entry?: Doc<"media">;
	onClose: () => void;
}

type MediaType = "movie" | "tvshow" | "book";
type MediaStatus = "watching" | "completed" | "planned";

export function MediaModal({ entry, onClose }: MediaModalProps) {
	const [type, setType] = useState<MediaType>(entry?.type ?? "movie");
	const [title, setTitle] = useState(entry?.title ?? "");
	const [coverUrl, setCoverUrl] = useState(entry?.coverUrl ?? "");
	const [status, setStatus] = useState<MediaStatus>(entry?.status ?? "planned");
	const [rating, setRating] = useState(entry?.rating ?? 0);
	const [progress, setProgress] = useState(entry?.progress ?? "");
	const [notes, setNotes] = useState(entry?.notes ?? "");
	const [tmdbId, setTmdbId] = useState<number | undefined>(entry?.tmdbId ?? undefined);
	const [showTmdbSearch, setShowTmdbSearch] = useState(false);
	const [saving, setSaving] = useState(false);

	const addMutation = useMutation(api.media.add);
	const updateMutation = useMutation(api.media.update);
	const { showToast } = useToast();

	const isEdit = !!entry;
	const canSearchTmdb = type === "movie" || type === "tvshow";
	const tmdbType = type === "tvshow" ? "tv" : "movie";

	const handleSave = async () => {
		if (!title.trim()) return;
		setSaving(true);

		try {
			if (isEdit) {
				await updateMutation({
					id: entry._id,
					type,
					title: title.trim(),
					coverUrl: coverUrl.trim() || undefined,
					status,
					rating: rating || undefined,
					progress: progress.trim() || undefined,
					notes: notes.trim() || undefined,
					tmdbId,
				});
				showToast("success", `已更新「${title}」`);
			} else {
				await addMutation({
					type,
					title: title.trim(),
					coverUrl: coverUrl.trim() || undefined,
					status,
					rating: rating || undefined,
					progress: progress.trim() || undefined,
					notes: notes.trim() || undefined,
					tmdbId,
				});
				showToast("success", `已添加「${title}」`);
			}
			onClose();
		} catch {
			showToast("error", "保存失败，请重试");
		} finally {
			setSaving(false);
		}
	};

	const handleTypeChange = (newType: MediaType) => {
		setType(newType);
		setTmdbId(undefined);
		setShowTmdbSearch(false);
	};

	const handleTitleChange = (value: string) => {
		setTitle(value);
		if (canSearchTmdb && value.trim().length >= 2) {
			setShowTmdbSearch(true);
		} else {
			setShowTmdbSearch(false);
		}
	};

	const handleTmdbSelect = (result: { id: number; title: string; coverUrl?: string }) => {
		setTitle(result.title);
		setCoverUrl(result.coverUrl ?? "");
		setTmdbId(result.id);
		setShowTmdbSearch(false);
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal-content">
				<div className="modal-header">
					<h2>{isEdit ? "编辑媒体" : "添加媒体"}</h2>
					<button type="button" className="btn-icon" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="modal-body">
					<div className="form-group">
						<label className="form-label" htmlFor="media-title">
							标题 *
							{canSearchTmdb && (
								<span className="tmdb-badge">
									{tmdbId ? "✅ 已关联 TMDB" : "🔍 支持 TMDB 搜索"}
								</span>
							)}
						</label>
						<input
							id="media-title"
							className="form-input"
							type="text"
							value={title}
							onChange={(e) => handleTitleChange(e.target.value)}
							placeholder={canSearchTmdb ? "输入标题搜索 TMDB..." : "输入标题..."}
							autoFocus
						/>
						{canSearchTmdb && (
							<TMDBSearch
								query={title}
								type={tmdbType}
								visible={showTmdbSearch}
								onSelect={handleTmdbSelect}
							/>
						)}
					</div>

					<div className="form-row">
						<div className="form-group">
							<label className="form-label" htmlFor="media-type">
								类型
							</label>
							<select
								id="media-type"
								className="form-select"
								value={type}
								onChange={(e) => handleTypeChange(e.target.value as MediaType)}
							>
								<option value="movie">🎬 电影</option>
								<option value="tvshow">📺 剧集</option>
								<option value="book">📖 书籍</option>
							</select>
						</div>

						<div className="form-group">
							<label className="form-label" htmlFor="media-status">
								状态
							</label>
							<select
								id="media-status"
								className="form-select"
								value={status}
								onChange={(e) => setStatus(e.target.value as MediaStatus)}
							>
								<option value="watching">在看</option>
								<option value="completed">已完成</option>
								<option value="planned">想看</option>
							</select>
						</div>
					</div>

					<div className="form-group">
						<label className="form-label" htmlFor="media-cover">
							封面链接
						</label>
						<input
							id="media-cover"
							className="form-input"
							type="url"
							value={coverUrl}
							onChange={(e) => setCoverUrl(e.target.value)}
							placeholder="https://example.com/cover.jpg"
						/>
					</div>

					<div className="form-group">
						<label className="form-label">评分</label>
						<div className="star-rating">
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
								<button
									type="button"
									key={v}
									className={`star-rating-btn ${v <= rating ? "filled" : ""}`}
									onClick={() => setRating(v === rating ? 0 : v)}
								>
									{v <= rating ? "★" : "☆"}
								</button>
							))}
						</div>
					</div>

					<div className="form-group">
						<label className="form-label" htmlFor="media-progress">
							进度
						</label>
						<input
							id="media-progress"
							className="form-input"
							type="text"
							value={progress}
							onChange={(e) => setProgress(e.target.value)}
							placeholder="例：第2季第5集 / 第120页"
						/>
					</div>

					<div className="form-group">
						<label className="form-label" htmlFor="media-notes">
							备注
						</label>
						<textarea
							id="media-notes"
							className="form-textarea"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="添加笔记..."
						/>
					</div>
				</div>

				<div className="modal-footer">
					<button type="button" className="btn btn-ghost" onClick={onClose}>
						取消
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleSave}
						disabled={!title.trim() || saving}
					>
						{saving ? "保存中..." : "保存"}
					</button>
				</div>
			</div>
		</div>
	);
}
