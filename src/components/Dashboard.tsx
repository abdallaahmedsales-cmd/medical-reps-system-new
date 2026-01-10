import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  currentUser: { userName: string; userCode: string; role?: string };
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // منع المندوبين من رؤية Dashboard
  if (currentUser.userCode !== "MANAGER@2026") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Activity className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-white/60">Dashboard is only accessible to managers</p>
        </div>
      </div>
    );
  }

  const stats = useQuery(api.medicalReps.getDashboardStats, {});
  const performanceData = useQuery(api.medicalReps.analyzePerformance, {});

  const handleAIAnalysis = async () => {
    if (!performanceData) {
      setAiAnalysis('⚠️ No data available for analysis yet.');
      return;
    }

    setIsAnalyzing(true);
    
    // محاكاة تحليل AI (يمكن استبداله بـ API حقيقي لاحقاً)
    setTimeout(() => {
      const reps = performanceData.representatives;
      const topPerformer = reps.reduce((max, rep) => 
        rep.totalVisits > max.totalVisits ? rep : max, reps[0]
      );
      const lowPerformer = reps.reduce((min, rep) => 
        rep.totalVisits < min.totalVisits ? rep : min, reps[0]
      );

    const analysis = `📊 **AI Performance Analysis**

✅ **Top Performer:** ${topPerformer?.name}
   • Actual Visits: ${topPerformer?.totalVisits}
   • Planned Doctors: ${topPerformer?.plannedDoctors || 0}

⚠️ **Needs Attention:** ${lowPerformer?.name}
   • Actual Visits: ${lowPerformer?.totalVisits}
   • Planned Doctors: ${lowPerformer?.plannedDoctors || 0}

📈 **Overall Stats:**
- Total Reports: ${performanceData.totalReports}
- Active Reps: ${reps.length}

🎯 **Action Items:**
1. Review coverage areas
2. Provide training if needed
3. Set weekly targets (minimum 10 doctors/week)`;






      setAiAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <BarChart3 className="w-10 h-10 text-purple-400" />
          <span>Manager Dashboard</span>
        </h1>
        <p className="text-white/70 text-lg">Overview of team performance and activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Weekly Plans</h3>
          <p className="text-3xl font-bold text-white">{stats?.weeklyPlans || 0}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Daily Reports</h3>
          <p className="text-3xl font-bold text-white">{stats?.dailyReports || 0}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Total Visits</h3>
          <p className="text-3xl font-bold text-white">{stats?.totalVisits || 0}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Hospitals</h3>
          <p className="text-3xl font-bold text-white">{stats?.hospitals || 0}</p>
        </div>
      </div>

      {/* 🆕 AI Analysis Section */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-yellow-400" />
            <span>AI Performance Analysis</span>
          </h2>
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
          </button>
        </div>

        {aiAnalysis ? (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
            <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {aiAnalysis}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Click "Analyze with AI" to get intelligent insights</p>
          </div>
        )}
      </div>

      {/* Team Performance Table */}
      {performanceData && performanceData.representatives.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
            <Users className="w-7 h-7 text-blue-400" />
            <span>Team Performance</span>
          </h2>
          
          <div className="overflow-x-auto md:overflow-x-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
  <th className="p-4 text-sm font-semibold">Representative</th>
  <th className="p-4 text-sm font-semibold">Total Visits</th>
  <th className="p-4 text-sm font-semibold">Reports</th>
  <th className="p-4 text-sm font-semibold">Planned Doctors</th>
  <th className="p-4 text-sm font-semibold">Status</th>ش
</tr>
              </thead>
              <tbody>
                {performanceData.representatives.map((rep: any) => (
                  <tr key={rep.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{rep.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                        {rep.totalVisits} visits
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{rep.reportsCount}</td>
                    <td className="p-4">
  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
    {rep.plannedDoctors} doctors
  </span>
</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        rep.totalVisits >= 10 
                          ? 'bg-green-500/20 text-green-300' 
                          : rep.totalVisits >= 5
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {rep.totalVisits >= 10 ? '✅ Excellent' : rep.totalVisits >= 5 ? '⚠️ Average' : '❌ Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;