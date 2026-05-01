import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	media: defineTable({
		userId: v.string(),
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
		dateCompleted: v.optional(v.string()),
		tmdbId: v.optional(v.number()),
	})
		.index("by_user", ["userId"])
		.index("by_user_status", ["userId", "status"])
		.index("by_user_type", ["userId", "type"]),
});
