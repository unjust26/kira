import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const invoiceItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  amount: v.number(),
});

const invoiceReturnValidator = v.object({
  _id: v.id("invoices"),
  _creationTime: v.number(),
  userId: v.id("users"),
  invoiceNumber: v.string(),
  contactName: v.string(),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  items: v.array(invoiceItemValidator),
  subtotal: v.number(),
  taxRate: v.number(),
  taxAmount: v.number(),
  total: v.number(),
  currency: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("paid"),
    v.literal("overdue"),
    v.literal("cancelled")
  ),
  issueDate: v.string(),
  dueDate: v.string(),
  notes: v.optional(v.string()),
  businessName: v.optional(v.string()),
  businessAddress: v.optional(v.string()),
});

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
  },
  returns: v.array(invoiceReturnValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.status) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_userId_and_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("invoices")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  returns: v.union(invoiceReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.userId !== userId) return null;
    return invoice;
  },
});

export const getNextNumber = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return "INV-0001";

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const num = invoices.length + 1;
    return `INV-${String(num).padStart(4, "0")}`;
  },
});

export const create = mutation({
  args: {
    invoiceNumber: v.string(),
    contactName: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    items: v.array(invoiceItemValidator),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    issueDate: v.string(),
    dueDate: v.string(),
    notes: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
  },
  returns: v.id("invoices"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("invoices", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("invoices"),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    items: v.optional(v.array(invoiceItemValidator)),
    subtotal: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    total: v.optional(v.number()),
    currency: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
    issueDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Invoice not found");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Invoice not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalOutstanding: v.number(),
    totalPaid: v.number(),
    totalOverdue: v.number(),
    draftCount: v.number(),
    sentCount: v.number(),
    paidCount: v.number(),
    overdueCount: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalOutstanding: 0,
        totalPaid: 0,
        totalOverdue: 0,
        draftCount: 0,
        sentCount: 0,
        paidCount: 0,
        overdueCount: 0,
      };
    }

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let totalOutstanding = 0;
    let totalPaid = 0;
    let totalOverdue = 0;
    let draftCount = 0;
    let sentCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    for (const inv of invoices) {
      switch (inv.status) {
        case "draft":
          draftCount++;
          break;
        case "sent":
          sentCount++;
          totalOutstanding += inv.total;
          break;
        case "paid":
          paidCount++;
          totalPaid += inv.total;
          break;
        case "overdue":
          overdueCount++;
          totalOverdue += inv.total;
          totalOutstanding += inv.total;
          break;
      }
    }

    return {
      totalOutstanding,
      totalPaid,
      totalOverdue,
      draftCount,
      sentCount,
      paidCount,
      overdueCount,
    };
  },
});
