import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("receipts"),
      _creationTime: v.number(),
      userId: v.id("users"),
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(),
      description: v.optional(v.string()),
      amount: v.optional(v.number()),
      currency: v.optional(v.string()),
      date: v.string(),
      transactionId: v.optional(v.id("transactions")),
      url: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      receipts.map(async (r) => ({
        ...r,
        url: await ctx.storage.getUrl(r.storageId),
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    date: v.string(),
    transactionId: v.optional(v.id("transactions")),
  },
  returns: v.id("receipts"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("receipts", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("receipts"),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    date: v.optional(v.string()),
    transactionId: v.optional(v.id("transactions")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Receipt not found");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("receipts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Receipt not found");
    }

    await ctx.storage.delete(existing.storageId);
    await ctx.db.delete(args.id);
    return null;
  },
});
