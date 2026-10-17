import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CustomerDashboard from './pages/CustomerDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetailView from './pages/ServiceDetailView';
import ServiceRequestModal from './components/ServiceRequestModal';
import api from './services/api';
import { Car, ShieldCheck, CheckCircle2 } from 'lucide-react';

const MainContent = () => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        api.getVehicles(),
        api.getServiceRequests(),
      ]);
      if (vRes.success) setVehicles(vRes.data);
      if (sRes.success) {
        setServiceRequests(sRes.data);
        // If a case is selected, refresh its state
        if (selectedCase) {
          const updated = sRes.data.find(r => r._id === selectedCase._id);
          if (updated) setSelectedCase(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCase]);

  useEffect(() => {
    loadData();
    // Refresh interval for live status updates
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [loadData]);

  // When switching persona, clear single case drilldown to show that role's cockpit
  useEffect(() => {
    setSelectedCase(null);
  }, [currentUser?.role]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenRequestModal={() => setIsRequestModalOpen(true)} />

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {selectedCase ? (
            <ServiceDetailView
              serviceRequest={selectedCase}
              onBack={() => setSelectedCase(null)}
              onRefresh={loadData}
            />
          ) : (
            <>
              {currentUser?.role === 'customer' && (
                <CustomerDashboard
                  vehicles={vehicles}
                  serviceRequests={serviceRequests}
                  onOpenRequestModal={() => setIsRequestModalOpen(true)}
                  onRefresh={loadData}
                  onSelectCase={c => setSelectedCase(c)}
                />
              )}

              {currentUser?.role === 'advisor' && (
                <AdvisorDashboard
                  serviceRequests={serviceRequests}
                  onRefresh={loadData}
                  onSelectCase={c => setSelectedCase(c)}
                />
              )}

              {currentUser?.role === 'technician' && (
                <TechnicianDashboard
                  serviceRequests={serviceRequests}
                  onRefresh={loadData}
                  onSelectCase={c => setSelectedCase(c)}
                />
              )}

              {currentUser?.role === 'admin' && (
                <AdminDashboard
                  serviceRequests={serviceRequests}
                  onSelectCase={c => setSelectedCase(c)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Global Booking Modal */}
      <ServiceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Enterprise Footer */}
      <footer style={{
        background: 'rgba(7, 10, 18, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem 0',
        marginTop: 'auto',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              <strong style={{ color: '#fff' }}>Urban Fleet Operations</strong> • Vehicle Service Management Platform
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="pulse-indicator pulse-green" /> MERN Backend Active (Port 5001)
            </span>
            <span style={{ color: 'var(--border-medium)' }}>|</span>
            <span>Modeled on Pega Case Lifecycle & SLA Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
