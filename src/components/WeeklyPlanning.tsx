import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Calendar, 
  Plus, 
  Save, 
  Trash2,
  Target,
  MapPin,
  Stethoscope,
  Package,
  History
} from 'lucide-react';
import { toast } from "sonner";

interface DayPlan {
  doctorName: string;
  specialty: string;
  area: string;
  products: string[];
}

interface WeeklyPlanningProps {
  currentUser: { userName: string; userCode: string; areas?: string[]; role?: string };
}

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'] as const;
const DAY_NAMES = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء'
};

const PRODUCTS = [
  'Etoricox 60',
  'Etoricox 90',
  'Etoricox 120',
  'Flexilax',
  'Miacalcic'
];

const WeeklyPlanning: React.FC<WeeklyPlanningProps> = ({ currentUser }) => {
  const [weekStartDate, setWeekStartDate] = useState('');
  const [plans, setPlans] = useState<Record<string, DayPlan[]>>({
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: []
  });

  const saveWeeklyPlan = useMutation(api.medicalReps.saveWeeklyPlan);
  
  // جلب الخطط السابقة
  const allPlans = useQuery(api.medicalReps.getWeeklyPlans, {}) || [];
  
  // فلترة الخطط حسب الصلاحية
  const myPlans = currentUser.userCode === "MANAGER@2026" 
    ? allPlans 
    : allPlans.filter(p => p.representative === currentUser.userCode);

  const addDoctorToDay = (day: string) => {
    setPlans(prev => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          doctorName: '',
          specialty: '',
          area: currentUser.areas?.[0] || '',
          products: []
        }
      ]
    }));
  };

  const removeDoctorFromDay = (day: string, index: number) => {
    setPlans(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateDoctor = (day: string, index: number, field: keyof DayPlan, value: any) => {
    setPlans(prev => ({
      ...prev,
      [day]: prev[day].map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const toggleProduct = (day: string, index: number, product: string) => {
    setPlans(prev => ({
      ...prev,
      [day]: prev[day].map((doc, i) => {
        if (i === index) {
          const hasProduct = doc.products.includes(product);
          return {
            ...doc,
            products: hasProduct 
              ? doc.products.filter(p => p !== product)
              : [...doc.products, product]
          };
        }
        return doc;
      })
    }));
  };

  const handleSubmit = async () => {
    if (!weekStartDate) {
      toast.error('Please select week start date');
      return;
    }

    const totalDoctors = Object.values(plans).reduce((sum, day) => sum + day.length, 0);
    if (totalDoctors === 0) {
      toast.error('Please add at least one doctor visit');
      return;
    }

    const hasIncomplete = Object.values(plans).some(dayPlans => 
      dayPlans.some(doc => !doc.doctorName.trim() || !doc.specialty.trim() || doc.products.length === 0)
    );

    if (hasIncomplete) {
      toast.error('Please complete all doctor details and select products');
      return;
    }

    try {
      await saveWeeklyPlan({
        representative: currentUser.userCode,
        repName: currentUser.userName,
        weekStartDate,
        plan: plans as any
      });

      toast.success('Weekly plan submitted successfully! ✅');
      
      // Reset form
      setWeekStartDate('');
      setPlans({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: []
      });
    } catch (error) {
      toast.error('Failed to submit weekly plan');
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <Calendar className="w-10 h-10 text-blue-400" />
          <span>Weekly Planning</span>
        </h1>
        <p className="text-white/70 text-lg">Plan your weekly doctor visits and product presentations</p>
      </div>

      {/* Week Start Date */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="max-w-md mx-auto">
          <label className="flex items-center space-x-2 text-white font-medium mb-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>Week Start Date (Saturday)</span>
          </label>
          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
          />
        </div>
      </div>

      {/* Days Planning */}
      <div className="space-y-6">
        {DAYS.map(day => (
          <div key={day} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-400" />
                <span>{DAY_NAMES[day]}</span>
                <span className="text-white/50 text-lg">({plans[day].length} visits)</span>
              </h2>
              <button
                onClick={() => addDoctorToDay(day)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Visit</span>
              </button>
            </div>

            <div className="space-y-4">
              {plans[day].map((doctor, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-white font-semibold">Visit {index + 1}</h3>
                    </div>
                    <button
                      onClick={() => removeDoctorFromDay(day, index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Doctor Name */}
                    <div>
                      <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                        <Stethoscope className="w-4 h-4" />
                        <span>Doctor Name</span>
                      </label>
                      <input
                        type="text"
                        value={doctor.doctorName}
                        onChange={(e) => updateDoctor(day, index, 'doctorName', e.target.value)}
                        placeholder="Enter doctor name"
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                        <Target className="w-4 h-4" />
                        <span>Specialty</span>
                      </label>
                      <select
  value={doctor.specialty}
  onChange={(e) => updateDoctor(day, index, 'specialty', e.target.value)}
  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select specialty</option>
  <option value="Orthopedic" className="bg-gray-800">Orthopedic</option>
  <option value="Rheumatology" className="bg-gray-800">Rheumatology</option>
  <option value="Internal Medicine" className="bg-gray-800">Internal Medicine</option>
  <option value="General Practice" className="bg-gray-800">General Practice</option>
  <option value="Pain Management" className="bg-gray-800">Pain Management</option>
  <option value="Geriatrics" className="bg-gray-800">Geriatrics</option>
</select>
                    </div>

                    {/* Area */}
                    <div>
                      <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>Area</span>
                      </label>
                      <select
                        value={doctor.area}
                        onChange={(e) => updateDoctor(day, index, 'area', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select area</option>
                        {currentUser.areas?.map(area => (
                          <option key={area} value={area} className="bg-gray-800">
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Products */}
                    <div>
                      <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                        <Package className="w-4 h-4" />
                        <span>Products to Present</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCTS.map(product => (
                          <button
                            key={product}
                            type="button"
                            onClick={() => toggleProduct(day, index, product)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                              doctor.products.includes(product)
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                          >
                            {product}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {plans[day].length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40">No visits planned for this day</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {Object.values(plans).some(day => day.length > 0) && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!weekStartDate}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto shadow-lg"
          >
            <Save className="w-6 h-6" />
            <span>Submit Weekly Plan</span>
          </button>
          <p className="text-white/60 text-sm mt-3">
            Review all visits before submitting
          </p>
        </div>
      )}

      {/* 🆕 جدول السجل (History Table) */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <History className="w-7 h-7 text-purple-400" />
          <span>Plans History</span>
        </h2>
        
        <div className="overflow-x-auto md:overflow-x-visible">

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white/60 border-b border-white/10">
                <th className="p-4 text-sm font-semibold">Week Start</th>
                <th className="p-4 text-sm font-semibold">Rep Name</th>
                <th className="p-4 text-sm font-semibold">Total Visits</th>
                <th className="p-4 text-sm font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {myPlans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">
                    No plans found yet.
                  </td>
                </tr>
              ) : (
                myPlans.map((plan: any) => (
                  <tr key={plan._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">{plan.weekStartDate}</td>
                    <td className="p-4 font-medium text-blue-300">{plan.repName}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                        {plan.totalDoctors} visits
                      </span>
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {new Date(plan.submittedAt).toLocaleDateString()}
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
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WeeklyPlanning;