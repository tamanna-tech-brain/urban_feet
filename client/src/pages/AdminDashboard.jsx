import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  Users, 
  Search, 
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import api from '../services/api';

export const AdminDashboard = ({
  serviceRequests,
  onSelectCase,
}) => {
  const [stats, setStats] = useState(null);
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [serviceRequests]);

  const loadAnalytics = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.getStats(),
        api.getServiceCenters(),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (cRes.success) setCenters(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCases = serviceRequests.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.caseId?.toLowerCase().includes(q) ||
      c.customer?.name?.toLowerCase().includes(q) ||
      c.vehicle?.make?.toLowerCase().includes(q) ||
      c.serviceType?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem' }}>Urban Fleet Operations — Executive Command</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          High-level operational metrics, SLA compliance, revenue telemetry, and service center workload
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Case Requests
            </span>
            <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {stats?.totalRequests || serviceRequests.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> +18% intake this month
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Active in Service Bays
            </span>
            <Clock size={18} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {stats?.inProgress || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Average duration: {stats?.avgTurnaroundHours || 18.2} hrs
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              SLA Compliance
            </span>
            <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>
            {stats?.slaComplianceRate || 98.4}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Target: 95.0% on 24h turnaround
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Service Revenue
            </span>
            <DollarSign size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '1,508.92'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            From authorized estimates & settled invoices
          </div>
        </div>
      </div>

      {/* Fleet Service Centers Capacity */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Fleet Service Center Capacity & Bays</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Physical locations handling vehicle inspections and repairs
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {centers.map(sc => (
            <div key={sc._id} className="glass-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>{sc.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Code: {sc.code}
                  </div>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {sc.bayCapacity} Active Bays
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {sc.address}, {sc.city}
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>Hours: {sc.operatingHours}</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Operational</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Case Records Table */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Master Case Audit Log</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Complete record of all vehicle service management cases across fleet hubs
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search case, customer, plate..."
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.8rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.4)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1.4fr 1.2fr 1fr 120px 100px',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}>
            <div>Case ID</div>
            <div>Vehicle & Service</div>
            <div>Customer</div>
            <div>Stage</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          {filteredCases.map(req => (
            <div
              key={req._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.4fr 1.2fr 1fr 120px 100px',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {req.caseId}
              </div>

              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>{req.serviceType}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {req.vehicle?.year} {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.licensePlate})
                </div>
              </div>

              <div>
                <div style={{ color: '#cbd5e1' }}>{req.customer?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{req.customer?.phone}</div>
              </div>

              <div style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>
                {req.currentStage}
              </div>

              <div>
                <span className={`badge ${
                  req.status === 'COMPLETED' ? 'badge-emerald' :
                  req.status === 'AWAITING_APPROVAL' ? 'badge-amber' :
                  req.status === 'REJECTED' ? 'badge-rose' : 'badge-cyan'
                }`} style={{ fontSize: '0.65rem' }}>
                  {req.status}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => onSelectCase(req)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
