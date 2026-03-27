import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { MediaModal } from "./MediaModal";

export function Navbar() {
	const [showModal, setShowModal] = useState(false);
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const links = [
		{ to: "/", label: "仪表盘", icon: "📊" },
		{ to: "/board", label: "看板", icon: "📋" },
		{ to: "/settings", label: "设置", icon: "⚙️" },
	] as const;

	return (
		<>
			<nav className="navbar">
				<div className="navbar-brand">
					<span className="navbar-brand-icon">🎬</span>
					<span>媒体追踪</span>
				</div>

				<div className="navbar-nav">
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`navbar-link ${currentPath === link.to ? "active" : ""}`}
						>
							<span>{link.icon}</span>
							<span>{link.label}</span>
						</Link>
					))}
				</div>

				<div className="navbar-actions">
					<SignedIn>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => setShowModal(true)}
						>
							+ 添加媒体
						</button>
						<UserButton />
					</SignedIn>
					<SignedOut>
						<SignInButton />
					</SignedOut>
				</div>
			</nav>

			{/* Mobile bottom nav */}
			<div className="mobile-nav">
				<div className="mobile-nav-links">
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`mobile-nav-link ${currentPath === link.to ? "active" : ""}`}
						>
							<span className="mobile-nav-link-icon">{link.icon}</span>
							<span>{link.label}</span>
						</Link>
					))}
					<button
						type="button"
						className={`mobile-nav-link ${showModal ? "active" : ""}`}
						onClick={() => setShowModal(true)}
					>
						<span className="mobile-nav-link-icon">➕</span>
						<span>添加</span>
					</button>
				</div>
			</div>

			{showModal && <MediaModal onClose={() => setShowModal(false)} />}
		</>
	);
}
