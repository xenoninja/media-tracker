interface StatsCardProps {
	icon: string;
	value: number;
	label: string;
	accent?: "violet" | "cyan" | "green" | "amber";
}

export function StatsCard({
	icon,
	value,
	label,
	accent = "violet",
}: StatsCardProps) {
	return (
		<div className={`stat-card stat-card-accent-${accent}`}>
			<div className="stat-card-icon">{icon}</div>
			<div className="stat-card-value">{value}</div>
			<div className="stat-card-label">{label}</div>
		</div>
	);
}
