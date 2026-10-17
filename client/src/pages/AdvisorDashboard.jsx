import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  FileSpreadsheet, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Eye, 
  Wrench,
  CheckCheck
} from 'lucide-react';
import CaseLifecycleStepper from '../components/CaseLifecycleStepper';
import InspectionModal from '../components/InspectionModal';
import EstimateModal from '../components/EstimateModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdvisorDashboard = ({
  serviceRequests,
  onRefresh,
  onSelectCase,
}) => {
  const { users, showToast } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [selectedCaseForInspection, setSelectedCaseForInspection] = useState(null);
  const [selectedCaseForEstimate, setSelectedCaseForEstimate] = useState(null);
  const [assigningCase, setAssigningCase] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const technicians = users.filter(u => u.role === 'technician');

  // Filter requests
  const filtered = serviceRequests.filter(req => {
    if (filter === 'ALL') return true;
    if (filter === 'INTAKE') return ['NEW', 'INSPECTION_PENDING'].includes(req.status);
    if (filter === 'APPROVAL') return req.status === 'AWAITING_APPROVAL';
    if (filter === 'SERVICE') return ['APPROVED', 'ASSIGNED', 'IN_PROGRESS'].includes(req.status);
    if (filter === 'QA') return ['QUALITY_CHECK', 'READY_FOR_PICKUP'].includes(req.status);
    if (filter === 'COMPLETED') return req.status === 'COMPLETED';
    return true;
  });

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!assigningCase || !selectedTechId) return;

    setAssignLoading(true);
    try {
      const res = await api.assignTechnician(assigningCase._id, {
        technicianId: selectedTechId,
      });
      if (res.success) {
        showToast(`Work order dispatched to technician!`);
        setAssigningCase(null);
        setSelectedTechId('');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFinalSignoff = async (caseItem) => {
    try {
      const res = await api.completeService(caseItem._id, {
        notes: 'Final quality road test passed. Vehicle ready for pickup.',
      });
      if (res.success) {
        showToast(`Service completed! Automated pickup notification sent to ${caseItem.customer?.name}.`);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem' }}>Service Advisor Intake & Dispatch Queue</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Conduct digital inspections, formulate estimates, assign technicians, and sign off deliveries
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)',
        }}>
          {[
            { id: 'ALL', label: 'All Cases' },
            { id: 'INTAKE', label: 'Intake & Inspection' },
            { id: 'APPROVAL', label: 'Awaiting Approval' },
            { id: 'SERVICE', label: 'In Service Bays' },
            { id: 'QA', label: 'QA & Pickup' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'var(--grad-amber)' : 'transparent',
                color: filter === f.id ? '#000' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: filter === f.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.map(req => {
          const needsInspection = !req.inspection;
          const needsEstimate = !req.estimate;
          const needsTech = req.status === 'APPROVED';
          const readyForSignoff = req.status === 'QUALITY_CHECK';

          return (
            <div key={req._id} className="glass-card">
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--accent-amber)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}>
                      {req.caseId}
                    </span>
                    <h3 style={{ fontSize: '1.15rem' }}>{req.serviceType}</h3>
                    <span className={`badge ${
                      req.status === 'COMPLETED' ? 'badge-emerald' :
                      req.status === 'AWAITING_APPROVAL' ? 'badge-amber' :
                      req.status === 'REJECTED' ? 'badge-rose' : 'badge-cyan'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Customer: <strong style={{ color: '#fff' }}>{req.customer?.name}</strong> • Phone: {req.customer?.phone} • Vehicle: <strong>{req.vehicle?.year} {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.licensePlate})</strong>
                  </div>
                </div>

                {/* Advisor Action Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {needsInspection && req.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setSelectedCaseForInspection(req)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'var(--accent-amber)', color: '#fbbf24' }}
                    >
                      <Search size={14} /> 25-Point Inspection
                    </button>
                  )}

                  {needsEstimate && req.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setSelectedCaseForEstimate(req)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'var(--accent-cyan)', color: '#00f2fe' }}
                    >
                      <FileSpreadsheet size={14} /> Create Estimate
                    </button>
                  )}

                  {needsTech && (
                    <button
                      onClick={() => {
                        setAssigningCase(req);
                        if (technicians.length) setSelectedTechId(technicians[0]._id);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <UserPlus size={14} /> Assign Technician
                    </button>
                  )}

                  {readyForSignoff && (
                    <button
                      onClick={() => handleFinalSignoff(req)}
                      className="btn btn-emerald btn-sm"
                    >
                      <CheckCheck size={14} /> Final QA Signoff
                    </button>
                  )}

                  <button
                    onClick={() => onSelectCase(req)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={14} /> View Case
                  </button>
                </div>
              </div>

              {/* Case Lifecycle Stepper */}
              <CaseLifecycleStepper
                currentStage={req.currentStage}
                status={req.status}
                slaDeadline={req.slaDeadline}
                isCompact={true}
              />

              {/* Concerns summary & status */}
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div>
                  <strong style={{ color: '#cbd5e1' }}>Reported Symptoms:</strong> {req.primaryConcerns}
                </div>
                {req.estimate && (
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Estimate: ${req.estimate.totalAmount?.toFixed(2)} ({req.estimate.customerDecision.toUpperCase()})
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technician Assignment Modal */}
      {assigningCase && (
        <div className="modal-overlay" onClick={() => setAssigningCase(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Dispatch Work Order to Technician</h3>
            </div>
            <form onSubmit={handleAssignTechnician}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Assign Case <strong>{assigningCase.caseId}</strong> ({assigningCase.serviceType}) to a certified technician.
                </p>
                <div className="form-group">
                  <label className="form-label">Select Certified Bay Technician</label>
                  <select
                    className="form-select"
                    value={selectedTechId}
                    onChange={e => setSelectedTechId(e.target.value)}
                    required
                  >
                    {technicians.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} - {t.specialization || 'Certified Fleet Tech'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssigningCase(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={assignLoading}>
                  {assignLoading ? 'Dispatching...' : 'Dispatch to Bay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      <InspectionModal
        isOpen={Boolean(selectedCaseForInspection)}
        onClose={() => setSelectedCaseForInspection(null)}
        serviceRequest={selectedCaseForInspection}
        onSuccess={onRefresh}
      />

      {/* Estimate Modal */}
      <EstimateModal
        isOpen={Boolean(selectedCaseForEstimate)}
        onClose={() => setSelectedCaseForEstimate(null)}
        serviceRequest={selectedCaseForEstimate}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default AdvisorDashboard;
