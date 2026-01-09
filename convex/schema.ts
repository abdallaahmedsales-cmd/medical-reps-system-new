import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Weekly Plans Collection
  weeklyPlans: defineTable({
    representative: v.string(), // REP_1, REP_2, etc.
    repName: v.string(),
    weekStartDate: v.string(),
    plan: v.object({
      saturday: v.array(v.object({
        doctorName: v.string(),
        specialty: v.string(),
        area: v.string(),
        products: v.array(v.string()),
      })),
      sunday: v.array(v.object({
        doctorName: v.string(),
        specialty: v.string(),
        area: v.string(),
        products: v.array(v.string()),
      })),
      monday: v.array(v.object({
        doctorName: v.string(),
        specialty: v.string(),
        area: v.string(),
        products: v.array(v.string()),
      })),
      tuesday: v.array(v.object({
        doctorName: v.string(),
        specialty: v.string(),
        area: v.string(),
        products: v.array(v.string()),
      })),
      wednesday: v.array(v.object({
        doctorName: v.string(),
        specialty: v.string(),
        area: v.string(),
        products: v.array(v.string()),
      })),
    }),
    totalDoctors: v.number(),
    submittedAt: v.number(),
  }).index("by_representative", ["representative"]),

  // Daily Reports Collection
  dailyReports: defineTable({
    representative: v.string(),
    repName: v.string(),
    reportDate: v.string(),
    visits: v.array(v.object({
      doctorName: v.string(),
      feedback: v.string(),
    })),
    submittedAt: v.number(),
  }).index("by_representative", ["representative"])
    .index("by_date", ["reportDate"]),

  // Hospitals Collection
  hospitals: defineTable({
    name: v.string(),
    location: v.string(),
    contactPerson: v.string(),
    phone: v.string(),
    representative: v.string(),
    repName: v.string(),
    products: v.object({
      etoricox60: v.string(), // pending/active/rejected
      etoricox90: v.string(),
      etoricox120: v.string(),
      flexilax: v.string(),
      miacalcic: v.string(),
    }),
    visits: v.array(v.object({
      date: v.string(),
      feedback: v.string(),
      visitedBy: v.string(),
    })),
    createdAt: v.number(),
  }).index("by_representative", ["representative"]),

  // User Sessions for authentication
  userSessions: defineTable({
    userCode: v.string(),
    userName: v.string(),
    role: v.string(), // "manager" or "representative"
    loginTime: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["userCode"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
