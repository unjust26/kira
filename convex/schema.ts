import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  transactions: defineTable({
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
    .index("by_userId", ["userId"])
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_userId_and_type", ["userId", "type"]),

  receipts: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    date: v.string(),
    transactionId: v.optional(v.id("transactions")),
  }).index("by_userId", ["userId"]),

  invoices: defineTable({
    userId: v.id("users"),
    invoiceNumber: v.string(),
    contactName: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        amount: v.number(),
      })
    ),
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
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"]),

  contacts: defineTable({
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
    .index("by_userId", ["userId"])
    .index("by_userId_and_type", ["userId", "type"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    color: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_type", ["userId", "type"]),

  budgets: defineTable({
    userId: v.id("users"),
    category: v.string(),
    amount: v.number(),
    currency: v.string(),
    period: v.union(v.literal("monthly"), v.literal("weekly"), v.literal("yearly")),
    startDate: v.string(),
  })
    .index("by_userId", ["userId"]),

  savingsGoals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    currency: v.string(),
    deadline: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  businessProfile: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    defaultCurrency: v.string(),
    taxRate: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
});

export default schema;
