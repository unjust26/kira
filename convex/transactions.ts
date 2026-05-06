import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      userId: v.id("users"),
      type: v.union(v.literal("income"), v.literal("expense")),
      amount: v.number(),
      currency: v.string(),
      category: v.string(),
      description: v.string(),
      date: v.string(),
      contactId: v.optional(v.id("contacts")),
      receiptId: v.optional(v.id("receipts")),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q;
    if (args.type) {
      q = ctx.db
        .query("transactions")
        .withIndex("by_userId_and_type", (q) =>
          q.eq("userId", userId).eq("type", args.type!)
        );
    } else {
      q = ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", userId));
    }

    const results = await q.order("desc").collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }
    return results;
  },
});

export const getStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  returns: v.object({
    totalIncome: v.number(),
    totalExpenses: v.number(),
    netProfit: v.number(),
    transactionCount: v.number(),
    incomeCount: v.number(),
    expenseCount: v.number(),
    categoryBreakdown: v.array(
      v.object({
        category: v.string(),
        type: v.union(v.literal("income"), v.literal("expense")),
        total: v.number(),
        count: v.number(),
      })
    ),
    monthlyData: v.array(
      v.object({
        month: v.string(),
        income: v.number(),
        expenses: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        categoryBreakdown: [],
        monthlyData: [],
      };
    }

    const all = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const filtered = all.filter((t) => {
      if (args.startDate && t.date < args.startDate) return false;
      if (args.endDate && t.date > args.endDate) return false;
      return true;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    const categoryMap = new Map<
      string,
      { type: "income" | "expense"; total: number; count: number }
    >();
    const monthlyMap = new Map<
      string,
      { income: number; expenses: number }
    >();

    for (const t of filtered) {
      if (t.type === "income") {
        totalIncome += t.amount;
        incomeCount++;
      } else {
        totalExpenses += t.amount;
        expenseCount++;
      }

      const key = `${t.category}_${t.type}`;
      const cat = categoryMap.get(key) || {
        type: t.type,
        total: 0,
        count: 0,
      };
      cat.total += t.amount;
      cat.count++;
      categoryMap.set(key, cat);

      const month = t.date.slice(0, 7);
      const m = monthlyMap.get(month) || { income: 0, expenses: 0 };
      if (t.type === "income") m.income += t.amount;
      else m.expenses += t.amount;
      monthlyMap.set(month, m);
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([key, val]) => ({
        category: key.split("_")[0],
        type: val.type,
        total: val.total,
        count: val.count,
      })
    );

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, val]) => ({
        month,
        income: val.income,
        expenses: val.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      transactionCount: filtered.length,
      incomeCount,
      expenseCount,
      categoryBreakdown,
      monthlyData,
    };
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    currency: v.string(),
    category: v.string(),
    description: v.string(),
    date: v.string(),
    contactId: v.optional(v.id("contacts")),
    receiptId: v.optional(v.id("receipts")),
    notes: v.optional(v.string()),
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("transactions", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    receiptId: v.optional(v.id("receipts")),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Transaction not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});
