import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    currency: v.string(),
    period: v.union(v.literal("monthly"), v.literal("weekly"), v.literal("yearly")),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("budgets", { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id("budgets"),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    period: v.optional(v.union(v.literal("monthly"), v.literal("weekly"), v.literal("yearly"))),
  },
  handler: async (ctx, { id, ...args }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== userId) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(args)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
