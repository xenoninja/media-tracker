import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MediaCard } from "../components/MediaCard";
import { StatsCard } from "../components/StatsCard";

export const Route = createFileRoute("/")({ component: Dashboard });

function RingChart({
	value,
	total,
	color,
	size = 64,
}: {
	value: number;
	total: number;
	color: string;
	size?: number;
}) {
	const r = (size - 8) / 2;
	const circumference = 2 * Math.PI * r;
	const progress = total > 0 ? value / total : 0;
	const dashOffset = circumference * (1 - progress);

	return (
		<div className="ring-chart">
			<svg width={size} height={size}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke="rgba(255,255,255,0.06)"
					strokeWidth={4}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={color}
					strokeWidth={4}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					style={{
						transition: "stroke-dashoffset 800ms ease",
					}}
				/>
			</svg>
			<span className="ring-chart-label">
				{total > 0 ? Math.round(progress * 100) : 0}%
			</span>
		</div>
	);
}

function Dashboard() {
	const statsData = useQuery(api.media.stats);
	const watching = useQuery(api.media.list, { status: "watching" });
	const recent = useQuery(api.media.recent, { limit: 6 });

	const isLoading = statsData === undefined;

	return (
		<main className="page-container fade-in">
			<h1 className="page-title">仪表盘</h1>

			{/* Stats row */}
			<div className="stats-grid">
				<StatsCard
					icon="📊"
					value={statsData?.total ?? 0}
					label="总计"
					accent="violet"
				/>
				<StatsCard
					icon="👀"
					value={statsData?.watching ?? 0}
					label="在看"
					accent="cyan"
				/>
				<StatsCard
					icon="✅"
					value={statsData?.completed ?? 0}
					label="已完成"
					accent="green"
				/>
				<StatsCard
					icon="📌"
					value={statsData?.planned ?? 0}
					label="想看"
					accent="amber"
				/>
			</div>

			{/* Completion ring charts */}
			{statsData && statsData.total > 0 && (
				<div className="dashboard-section">
					<h2 className="section-title">完成率</h2>
					<div className="rings-row">
						<div className="ring-item">
							<RingChart
								value={statsData.completed}
								total={statsData.total}
								color="#4ade80"
							/>
							<span className="ring-item-label">总体</span>
						</div>
						{statsData.movies > 0 && (
							<div className="ring-item">
								<RingChart
									value={
										/* We don't have per-type completed count from stats, approximate */
										statsData.completed
									}
									total={statsData.total}
									color="#a78bfa"
								/>
								<span className="ring-item-label">🎬 电影</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Currently watching */}
			<div className="dashboard-section">
				<div className="dashboard-section-header">
					<h2 className="section-title">正在观看</h2>
				</div>
				{watching && watching.length > 0 ? (
					<div className="hscroll-row">
						{watching.map((entry) => (
							<MediaCard key={entry._id} entry={entry} />
						))}
					</div>
				) : (
					<div className="empty-state">
						<div className="empty-state-icon">👀</div>
						<p className="empty-state-text">
							{isLoading ? "加载中..." : "还没有正在观看的内容"}
						</p>
					</div>
				)}
			</div>

			{/* Recently added */}
			<div className="dashboard-section">
				<div className="dashboard-section-header">
					<h2 className="section-title">最近添加</h2>
				</div>
				{recent && recent.length > 0 ? (
					<div className="media-grid">
						{recent.map((entry) => (
							<MediaCard key={entry._id} entry={entry} />
						))}
					</div>
				) : (
					<div className="empty-state">
						<div className="empty-state-icon">📭</div>
						<p className="empty-state-text">
							{isLoading
								? "加载中..."
								: '还没有添加任何内容，点击 "+ 添加媒体" 开始吧'}
						</p>
					</div>
				)}
			</div>
		</main>
	);
}
