import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
	const allData = useQuery(api.media.exportAll);
	const importAllMutation = useMutation(api.media.importAll);
	const clearAllMutation = useMutation(api.media.clearAll);
	const { showToast } = useToast();

	const [showConfirm, setShowConfirm] = useState(false);
	const [importing, setImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = () => {
		if (!allData) return;
		const exportData = allData.map(
			({ _id, _creationTime, userId, ...rest }) => rest,
		);
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `media-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showToast("success", `已导出 ${allData.length} 条记录`);
	};

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setImporting(true);
		try {
			const text = await file.text();
			const data = JSON.parse(text);

			if (!Array.isArray(data)) {
				throw new Error("Invalid format");
			}

			await importAllMutation({
				entries: data,
				clearExisting: false,
			});
			showToast("success", `已导入 ${data.length} 条记录`);
		} catch {
			showToast("error", "导入失败，请检查文件格式");
		} finally {
			setImporting(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleClearAll = async () => {
		try {
			await clearAllMutation();
			showToast("success", "已清空所有数据");
			setShowConfirm(false);
		} catch {
			showToast("error", "清空失败");
		}
	};

	return (
		<main className="page-container fade-in">
			<h1 className="page-title">设置</h1>

			{/* Export */}
			<div className="settings-section">
				<h3>📤 导出数据</h3>
				<p>将所有追踪数据导出为 JSON 文件作为备份。</p>
				<button
					type="button"
					className="btn btn-ghost"
					onClick={handleExport}
					disabled={!allData}
				>
					{allData ? `导出 (${allData.length} 条记录)` : "加载中..."}
				</button>
			</div>

			{/* Import */}
			<div className="settings-section">
				<h3>📥 导入数据</h3>
				<p>从 JSON 备份文件导入追踪数据。导入的数据将与现有数据合并。</p>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					onChange={handleImport}
					style={{ display: "none" }}
				/>
				<button
					type="button"
					className="btn btn-ghost"
					onClick={() => fileInputRef.current?.click()}
					disabled={importing}
				>
					{importing ? "导入中..." : "选择文件"}
				</button>
			</div>

			{/* Danger zone */}
			<div className="settings-section settings-danger">
				<h3>⚠️ 危险操作</h3>
				<p>删除所有追踪数据。此操作不可撤销。</p>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => setShowConfirm(true)}
				>
					清空所有数据
				</button>
			</div>

			{/* Confirmation dialog */}
			{showConfirm && (
				<div
					className="confirm-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowConfirm(false);
					}}
				>
					<div className="confirm-dialog">
						<h3>确定要删除所有数据吗？</h3>
						<p>
							此操作将永久删除你的所有追踪记录，且无法恢复。建议先导出数据备份。
						</p>
						<div className="confirm-actions">
							<button
								type="button"
								className="btn btn-ghost"
								onClick={() => setShowConfirm(false)}
							>
								取消
							</button>
							<button
								type="button"
								className="btn btn-danger"
								onClick={handleClearAll}
							>
								确认删除
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
