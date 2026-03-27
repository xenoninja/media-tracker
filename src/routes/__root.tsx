import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/Toast";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import componentsCss from "../styles/components.css?url";
import globalCss from "../styles/global.css?url";
import pagesCss from "../styles/pages.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "媒体追踪 — 追踪你的影视与书籍" },
			{
				name: "description",
				content: "追踪你正在观看、已完成和计划观看的电影、剧集和书籍",
			},
		],
		links: [
			{ rel: "stylesheet", href: globalCss },
			{ rel: "stylesheet", href: componentsCss },
			{ rel: "stylesheet", href: pagesCss },
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="zh-CN">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					<ConvexProvider>
						<ToastProvider>
							<SignedIn>
								<Navbar />
								<Outlet />
							</SignedIn>
							<SignedOut>
								<div className="sign-in-page">
									<div className="sign-in-container">
										<h1>🎬 媒体追踪</h1>
										<p>登录以管理你的影视与书籍追踪列表</p>
										<SignInButton mode="modal">
											<button type="button" className="btn btn-primary">
												登录 / 注册
											</button>
										</SignInButton>
									</div>
								</div>
							</SignedOut>
						</ToastProvider>
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
