import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Helpers ─────────────────────────────────────────────

async function requireUser(ctx: {
	auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error("Not authenticated");
	}
	return identity.subject;
}

// ── Queries ─────────────────────────────────────────────

export const list = query({
	args: {
		type: v.optional(
			v.union(v.literal("movie"), v.literal("tvshow"), v.literal("book")),
		),
		status: v.optional(
			v.union(
				v.literal("watching"),
				v.literal("completed"),
				v.literal("planned"),
			),
		),
		search: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);

		const baseQuery = ctx.db
			.query("media")
			.withIndex("by_user", (q) => q.eq("userId", userId));

		let results = await baseQuery.order("desc").collect();

		// Filter by status
		if (args.status) {
			results = results.filter((r) => r.status === args.status);
		}

		// Filter by type
		if (args.type) {
			results = results.filter((r) => r.type === args.type);
		}

		// Client-side search filter
		if (args.search) {
			const term = args.search.toLowerCase();
			results = results.filter((r) => r.title.toLowerCase().includes(term));
		}

		return results;
	},
});

export const get = query({
	args: { id: v.id("media") },
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const entry = await ctx.db.get(args.id);
		if (!entry || entry.userId !== userId) {
			return null;
		}
		return entry;
	},
});

export const stats = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const all = await ctx.db
			.query("media")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const counts = {
			total: all.length,
			watching: 0,
			completed: 0,
			planned: 0,
			movies: 0,
			tvshows: 0,
			books: 0,
		};

		for (const entry of all) {
			counts[entry.status]++;
			if (entry.type === "movie") counts.movies++;
			else if (entry.type === "tvshow") counts.tvshows++;
			else counts.books++;
		}

		return counts;
	},
});

export const recent = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const limit = args.limit ?? 6;
		return await ctx.db
			.query("media")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.take(limit);
	},
});

export const exportAll = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		return await ctx.db
			.query("media")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
	},
});

// ── Mutations ───────────────────────────────────────────

export const add = mutation({
	args: {
		type: v.union(v.literal("movie"), v.literal("tvshow"), v.literal("book")),
		title: v.string(),
		coverUrl: v.optional(v.string()),
		status: v.union(
			v.literal("watching"),
			v.literal("completed"),
			v.literal("planned"),
		),
		rating: v.optional(v.number()),
		notes: v.optional(v.string()),
		progress: v.optional(v.string()),
		tmdbId: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		return await ctx.db.insert("media", {
			...args,
			userId,
			dateCompleted:
				args.status === "completed" ? new Date().toISOString() : undefined,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("media"),
		type: v.optional(
			v.union(v.literal("movie"), v.literal("tvshow"), v.literal("book")),
		),
		title: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		status: v.optional(
			v.union(
				v.literal("watching"),
				v.literal("completed"),
				v.literal("planned"),
			),
		),
		rating: v.optional(v.number()),
		notes: v.optional(v.string()),
		progress: v.optional(v.string()),
		tmdbId: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const existing = await ctx.db.get(args.id);
		if (!existing || existing.userId !== userId) {
			throw new Error("Not found");
		}

		const { id, ...updates } = args;
		const patch: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(updates)) {
			if (value !== undefined) {
				patch[key] = value;
			}
		}

		// Auto-set dateCompleted when status changes to completed
		if (updates.status === "completed" && existing.status !== "completed") {
			patch.dateCompleted = new Date().toISOString();
		} else if (
			updates.status &&
			updates.status !== "completed" &&
			existing.status === "completed"
		) {
			patch.dateCompleted = undefined;
		}

		return await ctx.db.patch(args.id, patch);
	},
});

export const updateStatus = mutation({
	args: {
		id: v.id("media"),
		status: v.union(
			v.literal("watching"),
			v.literal("completed"),
			v.literal("planned"),
		),
	},
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const existing = await ctx.db.get(args.id);
		if (!existing || existing.userId !== userId) {
			throw new Error("Not found");
		}

		const patch: Record<string, unknown> = { status: args.status };
		if (args.status === "completed" && existing.status !== "completed") {
			patch.dateCompleted = new Date().toISOString();
		} else if (args.status !== "completed" && existing.status === "completed") {
			patch.dateCompleted = undefined;
		}

		return await ctx.db.patch(args.id, patch);
	},
});

export const remove = mutation({
	args: { id: v.id("media") },
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const existing = await ctx.db.get(args.id);
		if (!existing || existing.userId !== userId) {
			throw new Error("Not found");
		}
		return await ctx.db.delete(args.id);
	},
});

export const importAll = mutation({
	args: {
				entries: v.array(
					v.object({
						type: v.union(
							v.literal("movie"),
							v.literal("tvshow"),
							v.literal("book"),
						),
						title: v.string(),
						coverUrl: v.optional(v.string()),
						status: v.union(
							v.literal("watching"),
							v.literal("completed"),
							v.literal("planned"),
						),
						rating: v.optional(v.number()),
						notes: v.optional(v.string()),
						progress: v.optional(v.string()),
						dateCompleted: v.optional(v.string()),
						tmdbId: v.optional(v.number()),
					}),
				),
		clearExisting: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);

		if (args.clearExisting) {
			const existing = await ctx.db
				.query("media")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.collect();
			for (const entry of existing) {
				await ctx.db.delete(entry._id);
			}
		}

		for (const entry of args.entries) {
			await ctx.db.insert("media", {
				...entry,
				userId,
			});
		}
	},
});

export const clearAll = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const all = await ctx.db
			.query("media")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
		for (const entry of all) {
			await ctx.db.delete(entry._id);
		}
	},
});
