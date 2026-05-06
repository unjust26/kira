import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    type: v.optional(
      v.union(v.literal("customer"), v.literal("vendor"), v.literal("both"))
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("contacts"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      type: v.union(
        v.literal("customer"),
        v.literal("vendor"),
        v.literal("both")
      ),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      company: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.type) {
      return await ctx.db
        .query("contacts")
        .withIndex("by_userId_and_type", (q) =>
          q.eq("userId", userId).eq("type", args.type!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("customer"), v.literal("vendor"), v.literal("both")),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("contacts"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("contacts", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal("customer"), v.literal("vendor"), v.literal("both"))
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Contact not found");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Contact not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});
