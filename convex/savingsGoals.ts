import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    currency: v.string(),
    deadline: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("savingsGoals", { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id("savingsGoals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    deadline: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(args)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const contribute = mutation({
  args: {
    id: v.id("savingsGoals"),
    amount: v.number(),
  },
  handler: async (ctx, { id, amount }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { currentAmount: goal.currentAmount + amount });
  },
});

export const remove = mutation({
  args: { id: v.id("savingsGoals") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
