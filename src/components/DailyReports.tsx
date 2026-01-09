import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  FileText, 
  Plus, 
  Save, 
  User, 
  MessageSquare,
  X,
  Target,
  Calendar,
  History
} from 'lucide-react';
import { toast } from "sonner";

interface DailyVisit {
  doctorName: string;
  feedback: string;
}

interface DailyReportsProps {
  currentUser: { userName: string; userCode: string; role?: string };
}

const DailyReports: React.FC<DailyReportsProps> = ({ currentUser }) => {
  const [reportDate, setReportDate] = useState('');
  const [visits, setVisits] = useState<DailyVisit[]>([]);

  const saveDailyReport = useMutation(api.medicalReps.saveDailyReport);
  
  // جلب التقارير السابقة
  const allReports = useQuery(api.medicalReps.getDailyReports, {}) || [];
  
  // فلترة التقارير حسب الصلاحية
  const myReports = currentUser.userCode === "MANAGER@2026" 
    ? allReports 
    : allReports.filter(r => r.representative === currentUser.userCode);

  const addVisit = () => {
    setVisits(prev => [
      ...prev,
      {
        doctorName: '',
        feedback: '',
      }
    ]);
  };

  const removeVisit = (index: number) => {
    setVisits(prev => prev.filter((_, i) => i !== index));
  };

  const updateVisit = (index: number, field: keyof DailyVisit, value: string) => {
    setVisits(prev => prev.map((visit, i) => 
      i === index ? { ...visit, [field]: value } : visit
    ));
  };

  const handleSubmit = async () => {
    if (!reportDate) {
      toast.error('Please select report date');
      return;
    }

    if (visits.length === 0) {
      toast.error('Please add at least one visit');
      return;
    }

    const incompleteVisits = visits.some(visit => !visit.doctorName.trim() || !visit.feedback.trim());
    if (incompleteVisits) {
      toast.error('Please complete all visit details');
      return;
    }

    try {
      await saveDailyReport({
        representative: currentUser.userCode,
        repName: currentUser.userName,
        reportDate,
        visits,
      });

      toast.success('Daily report submitted successfully! ✅');
      
      // Reset form
      setReportDate('');
      setVisits([]);
    } catch (error) {
      toast.error('Failed to submit daily report');
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <Target className="w-10 h-10 text-green-400" />
          <span>Daily Reports</span>
        </h1>
        <p className="text-white/70 text-lg">Submit your daily visit reports and feedback</p>
      </div>

      {/* Report Date */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="max-w-md mx-auto">
          <label className="flex items-center space-x-2 text-white font-medium mb-3">
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Report Date</span>
          </label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg"
          />
        </div>
      </div>

      {/* Visits Section */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="w-7 h-7 text-green-400" />
            <span>Visit Reports</span>
          </h2>
          <button
            onClick={addVisit}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Visit</span>
          </button>
        </div>

        <div className="space-y-6">
          {visits.map((visit, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 animate-slide-down"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-white font-semibold text-lg">Visit Report {index + 1}</h3>
                </div>
                <button
                  onClick={() => removeVisit(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Doctor Name */}
                <div>
                  <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                    <User className="w-4 h-4" />
                    <span>Doctor Name</span>
                  </label>
                  <input
                    type="text"
                    value={visit.doctorName}
                    onChange={(e) => updateVisit(index, 'doctorName', e.target.value)}
                    placeholder="Enter doctor's full name"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Detailed Feedback</span>
                  </label>
                  <textarea
                    value={visit.feedback}
                    onChange={(e) => updateVisit(index, 'feedback', e.target.value)}
                    placeholder="Provide detailed feedback about the visit, doctor's response, questions asked, products discussed, next steps, etc."
                    rows={6}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    Be as detailed as possible - include doctor's reactions, questions, concerns, and follow-up actions
                  </p>
                </div>
              </div>
            </div>
          ))}

          {visits.length === 0 && (
            <div className="text-center py-16">
              <Target className="w-20 h-20 text-white/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white/60 mb-2">No Visits Added Yet</h3>
              <p className="text-white/40 text-lg mb-6">Start by adding your first visit report</p>
              <button
                onClick={addVisit}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
              >
                Add Your First Visit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {visits.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!reportDate || visits.length === 0}
            className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto shadow-lg"
          >
            <Save className="w-6 h-6" />
            <span>Submit Daily Report</span>
          </button>
          <p className="text-white/60 text-sm mt-3">
            Make sure all visit details are complete before submitting
          </p>
        </div>
      )}

      {/* 🆕 جدول السجل (History Table) */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <History className="w-7 h-7 text-blue-400" />
          <span>Visit History</span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white/60 border-b border-white/10">
                <th className="p-4 text-sm font-semibold">Date</th>
                <th className="p-4 text-sm font-semibold">Rep Name</th>
                <th className="p-4 text-sm font-semibold">Visits</th>
                <th className="p-4 text-sm font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {myReports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">
                    No reports found yet.
                  </td>
                </tr>
              ) : (
                myReports.map((report: any) => (
                  <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">{report.reportDate}</td>
                    <td className="p-4 font-medium text-green-300">{report.repName}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {report.visits.map((visit: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <span className="text-white/80">• {visit.doctorName}</span>
                            <p className="text-white/50 text-xs ml-3">{visit.feedback.substring(0, 60)}...</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DailyReports;