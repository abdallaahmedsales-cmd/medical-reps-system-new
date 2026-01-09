import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  MessageSquare,
  X,
  Save,
  Eye,
  Circle
} from 'lucide-react';
import { toast } from "sonner";

interface Hospital {
  _id: any; // Convex ID type
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  products: {
    etoricox60: string;
    etoricox90: string;
    etoricox120: string;
    flexilax: string;
    miacalcic: string;
  };
  visits: Array<{
    date: string;
    feedback: string;
    visitedBy: string;
  }>;
}

interface HospitalsManagementProps {
  currentUser: { userName: string; userCode: string; role: string };
}

const HospitalsManagement: React.FC<HospitalsManagementProps> = ({ currentUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
  });
  const [visitData, setVisitData] = useState({
    date: '',
    feedback: '',
  });

  const hospitals = useQuery(api.medicalReps.getHospitals, {
    representative: currentUser.role === 'representative' ? currentUser.userCode : undefined
  });

  const addHospital = useMutation(api.medicalReps.addHospital);
  const logHospitalVisit = useMutation(api.medicalReps.logHospitalVisit);
  const updateProductStatus = useMutation(api.medicalReps.updateProductStatus);

  const products = [
    { key: 'etoricox60', name: 'Etoricox 60' },
    { key: 'etoricox90', name: 'Etoricox 90' },
    { key: 'etoricox120', name: 'Etoricox 120' },
    { key: 'flexilax', name: 'Flexilax' },
    { key: 'miacalcic', name: 'Miacalcic' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    const baseClass = "w-3 h-3 rounded-full";
    switch (status) {
      case 'active': return `${baseClass} bg-green-500 animate-pulse`;
      case 'pending': return `${baseClass} bg-yellow-500 animate-pulse`;
      case 'rejected': return `${baseClass} bg-red-500`;
      default: return `${baseClass} bg-gray-500`;
    }
  };

  const handleAddHospital = async () => {
    if (!newHospital.name || !newHospital.location || !newHospital.contactPerson || !newHospital.phone) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addHospital({
        ...newHospital,
        representative: currentUser.userCode,
        repName: currentUser.userName,
      });

      toast.success('Hospital added successfully! 🏥');
      setShowAddModal(false);
      setNewHospital({ name: '', location: '', contactPerson: '', phone: '' });
    } catch (error) {
      toast.error('Failed to add hospital');
      console.error('Add hospital error:', error);
    }
  };

  const handleLogVisit = async () => {
    if (!visitData.date || !visitData.feedback) {
      toast.error('Please fill all visit details');
      return;
    }

    if (!selectedHospital) return;
    
    try {
      await logHospitalVisit({
        hospitalId: selectedHospital._id,
        date: visitData.date,
        feedback: visitData.feedback,
        visitedBy: currentUser.userName,
      });

      toast.success('Visit logged successfully! ✅');
      setShowVisitModal(false);
      setVisitData({ date: '', feedback: '' });
      setSelectedHospital(null);
    } catch (error) {
      toast.error('Failed to log visit');
      console.error('Log visit error:', error);
    }
  };

  const handleStatusChange = async (hospitalId: any, product: string, newStatus: string) => {
    try {
      await updateProductStatus({
        hospitalId,
        product,
        status: newStatus,
      });
      toast.success('Product status updated! 🔄');
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Update status error:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <Building2 className="w-10 h-10 text-purple-400" />
          <span>Hospitals Management</span>
        </h1>
        <p className="text-white/70 text-lg">Manage your hospital relationships and track visits</p>
      </div>

      {/* Add Hospital Button */}
      <div className="text-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Hospital</span>
        </button>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals?.map((hospital, index) => (
          <div
            key={hospital._id}
            className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hospital Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {hospital.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{hospital.name}</h3>
                  <p className="text-white/60 text-sm flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {hospital.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <p className="text-white/80 text-sm flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-400" />
                {hospital.contactPerson}
              </p>
              <p className="text-white/80 text-sm flex items-center">
                <Phone className="w-4 h-4 mr-2 text-purple-400" />
                {hospital.phone}
              </p>
            </div>

            {/* Products Status */}
            <div className="mb-4">
              <h4 className="text-white font-medium text-sm mb-3">Product Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {products.map(product => (
                  <div key={product.key} className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">{product.name}</span>
                    <div className="flex items-center space-x-1">
                      <div className={getStatusIcon(hospital.products[product.key as keyof typeof hospital.products])}></div>
                      <select
                        value={hospital.products[product.key as keyof typeof hospital.products]}
                        onChange={(e) => handleStatusChange(hospital._id, product.key, e.target.value)}
                        className="text-xs bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white"
                      >
                        <option value="pending" className="bg-gray-800">Pending</option>
                        <option value="active" className="bg-gray-800">Active</option>
                        <option value="rejected" className="bg-gray-800">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Visit */}
            {hospital.visits && hospital.visits.length > 0 && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs mb-1">Last Visit</p>
                <p className="text-white text-sm font-medium">
                  {hospital.visits[hospital.visits.length - 1].date}
                </p>
                <p className="text-white/70 text-xs">
                  by {hospital.visits[hospital.visits.length - 1].visitedBy}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedHospital(hospital);
                  setShowVisitModal(true);
                }}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                Log Visit
              </button>
              {hospital.visits && hospital.visits.length > 0 && (
                <button className="px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all duration-300">
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {(!hospitals || hospitals.length === 0) && (
          <div className="col-span-full text-center py-16">
            <Building2 className="w-20 h-20 text-white/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white/60 mb-2">No Hospitals Added Yet</h3>
            <p className="text-white/40 text-lg mb-6">Start by adding your first hospital</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Add Your First Hospital
            </button>
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Hospital</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Hospital Name</label>
                <input
                  type="text"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter hospital name"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={newHospital.location}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Contact Person</label>
                <input
                  type="text"
                  value={newHospital.contactPerson}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newHospital.phone}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHospital}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Add Hospital</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && selectedHospital && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Log Visit</h2>
              <button
                onClick={() => setShowVisitModal(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedHospital && (
              <div className="mb-4 p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-medium">{selectedHospital.name}</h3>
                <p className="text-white/60 text-sm">{selectedHospital.location}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Visit Date</span>
                </label>
                <input
                  type="date"
                  value={visitData.date}
                  onChange={(e) => setVisitData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Visit Feedback</span>
                </label>
                <textarea
                  value={visitData.feedback}
                  onChange={(e) => setVisitData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Describe the visit, discussions, outcomes, next steps..."
                  rows={4}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowVisitModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogVisit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Log Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HospitalsManagement;
