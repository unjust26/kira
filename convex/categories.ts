import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      type: v.union(v.literal("income"), v.literal("expense")),
      color: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.type) {
      return await ctx.db
        .query("categories")
        .withIndex("by_userId_and_type", (q) =>
          q.eq("userId", userId).eq("type", args.type!)
        )
        .collect();
    }

    return await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    color: v.optional(v.string()),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("categories", {
      userId,
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Category not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const seedDefaults = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) return null;

    const defaults = [
      { name: "Sales", type: "income" as const, color: "#10b981" },
      { name: "Services", type: "income" as const, color: "#06b6d4" },
      { name: "Consulting", type: "income" as const, color: "#8b5cf6" },
      { name: "Other Income", type: "income" as const, color: "#6366f1" },
      { name: "Rent", type: "expense" as const, color: "#ef4444" },
      { name: "Utilities", type: "expense" as const, color: "#f97316" },
      { name: "Supplies", type: "expense" as const, color: "#eab308" },
      { name: "Transport", type: "expense" as const, color: "#14b8a6" },
      { name: "Marketing", type: "expense" as const, color: "#ec4899" },
      { name: "Salary", type: "expense" as const, color: "#8b5cf6" },
      { name: "Equipment", type: "expense" as const, color: "#6366f1" },
      { name: "Food & Meals", type: "expense" as const, color: "#f59e0b" },
      { name: "Insurance", type: "expense" as const, color: "#64748b" },
      { name: "Other Expense", type: "expense" as const, color: "#94a3b8" },
    ];

    for (const cat of defaults) {
      await ctx.db.insert("categories", { userId, ...cat });
    }

    return null;
  },
});
