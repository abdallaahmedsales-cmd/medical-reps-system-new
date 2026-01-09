import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Representatives data
const REPRESENTATIVES = {
  "REP_1": { name: "Ahmed Nashaat", areas: ["Gerga", "Sohag City", "El Baliana", "El Manshaa", "Dar El Salam"] },
  "REP_2": { name: "Ahmed Osman", areas: ["Deshna", "Nagaa Hamady", "Farshout", "Qous", "Abou Tesht"] },
  "REP_3": { name: "Azza Moatamed", areas: ["El Menia", "Samalout", "Maghagha", "Beni Mazar", "Mattay"] },
  "REP_4": { name: "Mary Hosny", areas: ["Sohag City", "Tahta", "El Maragha", "Juhaynah", "Sakalta", "Tama"] },
  "REP_5": { name: "Mayar Gamal", areas: ["Assuit", "Manqabad", "Manfalout", "Dayrout", "El Qusiya", "El Wadi El Gedid"] },
  "REP_6": { name: "Sara Nabil", areas: ["Abou Korkas", "Dair Mouas", "Mallawi", "Minya City"] },
  "REP_7": { name: "Ahmed Hady", areas: ["Qena", "Luxor", "Hurghada", "Qeft", "Naqada"] },
};

// Authentication
export const authenticateUser = mutation({
  args: { userCode: v.string() },
  handler: async (ctx, args) => {
    const { userCode } = args;
    
    if (userCode === "MANAGER@2026") {
      await ctx.db.insert("userSessions", {
        userCode,
        userName: "Manager",
        role: "manager",
        loginTime: Date.now(),
        isActive: true,
      });
      return { success: true, role: "manager", userName: "Manager" };
    }
    
    if (REPRESENTATIVES[userCode as keyof typeof REPRESENTATIVES]) {
      const rep = REPRESENTATIVES[userCode as keyof typeof REPRESENTATIVES];
      await ctx.db.insert("userSessions", {
        userCode,
        userName: rep.name,
        role: "representative",
        loginTime: Date.now(),
        isActive: true,
      });
      return { success: true, role: "representative", userName: rep.name, areas: rep.areas };
    }
    
    return { success: false, message: "Invalid access code" };
  },
});

// Get user session
export const getUserSession = query({
  args: { userCode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_code", (q) => q.eq("userCode", args.userCode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (session) {
      const repData = REPRESENTATIVES[args.userCode as keyof typeof REPRESENTATIVES];
      return {
        ...session,
        areas: repData?.areas || [],
      };
    }
    return null;
  },
});

// Weekly Plans
export const saveWeeklyPlan = mutation({
  args: {
    representative: v.string(),
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
  },
  handler: async (ctx, args) => {
    const totalDoctors = Object.values(args.plan).reduce((sum, day) => sum + day.length, 0);
    
    const planId = await ctx.db.insert("weeklyPlans", {
      ...args,
      totalDoctors,
      submittedAt: Date.now(),
    });
    
    return planId;
  },
});

export const getWeeklyPlans = query({
  args: { representative: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.representative) {
      return await ctx.db
        .query("weeklyPlans")
        .withIndex("by_representative", (q) => q.eq("representative", args.representative!))
        .collect();
    }
    return await ctx.db.query("weeklyPlans").collect();
  },
});

// Daily Reports
export const saveDailyReport = mutation({
  args: {
    representative: v.string(),
    repName: v.string(),
    reportDate: v.string(),
    visits: v.array(v.object({
      doctorName: v.string(),
      feedback: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("dailyReports", {
      ...args,
      submittedAt: Date.now(),
    });
    
    return reportId;
  },
});

export const getDailyReports = query({
  args: { representative: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.representative) {
      return await ctx.db
        .query("dailyReports")
        .withIndex("by_representative", (q) => q.eq("representative", args.representative!))
        .collect();
    }
    return await ctx.db.query("dailyReports").order("desc").take(10);
  },
});

// Hospitals
export const addHospital = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    contactPerson: v.string(),
    phone: v.string(),
    representative: v.string(),
    repName: v.string(),
  },
  handler: async (ctx, args) => {
    const hospitalId = await ctx.db.insert("hospitals", {
      ...args,
      products: {
        etoricox60: "pending",
        etoricox90: "pending",
        etoricox120: "pending",
        flexilax: "pending",
        miacalcic: "pending",
      },
      visits: [],
      createdAt: Date.now(),
    });
    
    return hospitalId;
  },
});

export const getHospitals = query({
  args: { representative: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.representative) {
      return await ctx.db
        .query("hospitals")
        .withIndex("by_representative", (q) => q.eq("representative", args.representative!))
        .collect();
    }
    return await ctx.db.query("hospitals").collect();
  },
});

export const logHospitalVisit = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    date: v.string(),
    feedback: v.string(),
    visitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital) throw new Error("Hospital not found");
    
    const newVisit = {
      date: args.date,
      feedback: args.feedback,
      visitedBy: args.visitedBy,
    };
    
    await ctx.db.patch(args.hospitalId, {
      visits: [...hospital.visits, newVisit],
    });
    
    return true;
  },
});

export const updateProductStatus = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    product: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital) throw new Error("Hospital not found");
    
    await ctx.db.patch(args.hospitalId, {
      products: {
        ...hospital.products,
        [args.product]: args.status,
      },
    });
    
    return true;
  },
});

// Dashboard Stats
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const weeklyPlans = await ctx.db.query("weeklyPlans").collect();
    const dailyReports = await ctx.db.query("dailyReports").collect();
    const hospitals = await ctx.db.query("hospitals").collect();
    
    const totalVisits = weeklyPlans.reduce((sum, plan) => sum + plan.totalDoctors, 0);
    
    return {
      weeklyPlans: weeklyPlans.length,
      dailyReports: dailyReports.length,
      hospitals: hospitals.length,
      totalVisits,
    };
  },
});

// Get representatives list for manager
export const getRepresentatives = query({
  args: {},
  handler: async () => {
    return Object.entries(REPRESENTATIVES).map(([code, data]) => ({
      code,
      name: data.name,
      areas: data.areas,
    }));
  },
});
// AI Analysis Function
export const analyzePerformance = query({
  args: {},
  handler: async (ctx) => {
    const dailyReports = await ctx.db.query("dailyReports").order("desc").take(50);
    const weeklyPlans = await ctx.db.query("weeklyPlans").order("desc").take(20);
    
    // تجميع البيانات حسب المندوب
    const repPerformance: Record<string, {
      name: string;
      totalVisits: number;
      reportsCount: number;
      plansCount: number;
      plannedDoctors: number; // ✅ أضفنا هنا
    }> = {};
    
    // تحليل التقارير اليومية
    dailyReports.forEach(report => {
      if (!repPerformance[report.representative]) {
        repPerformance[report.representative] = {
          name: report.repName,
          totalVisits: 0,
          reportsCount: 0,
          plansCount: 0,
          plannedDoctors: 0, // ✅ أضفنا هنا
        };
      }
      repPerformance[report.representative].totalVisits += report.visits.length;
      repPerformance[report.representative].reportsCount += 1;
    });
    
    // تحليل الخطط الأسبوعية
    weeklyPlans.forEach(plan => {
      if (!repPerformance[plan.representative]) {
        repPerformance[plan.representative] = {
          name: plan.repName,
          totalVisits: 0,
          reportsCount: 0,
          plansCount: 0,
          plannedDoctors: 0, // ✅ أضفنا هنا
        };
      }
      repPerformance[plan.representative].plansCount += 1;
      
      // ✅ حساب عدد الدكاترة المخطط لهم
      const doctorsInPlan = Object.values(plan.plan).reduce((sum, day) => sum + day.length, 0);
      repPerformance[plan.representative].plannedDoctors += doctorsInPlan;
    });
    
    return {
      totalReports: dailyReports.length,
      totalPlans: weeklyPlans.length,
      representatives: Object.entries(repPerformance).map(([code, data]) => ({
        code,
        ...data
      })),
      lastUpdated: Date.now(),
    };
  },
});
