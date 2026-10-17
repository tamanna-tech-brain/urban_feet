import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, XCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CHECKLIST = [
  { category: 'Braking System', item: 'Front & Rear Brake Pads Thickness', status: 'pass', notes: 'Pads measured at 7mm' },
  { category: 'Braking System', item: 'Brake Rotors & Caliper Hydraulic Fluid', status: 'pass', notes: 'Moisture < 1%' },
  { category: 'Tires & Suspension', item: 'Tire Tread Depth & PSI Pressure', status: 'warning', notes: 'Tread at 4/32", recommend rotation' },
  { category: 'Tires & Suspension', item: 'Front Control Arms, Ball Joints & Struts', status: 'pass', notes: 'No visible tear' },
  { category: 'Battery & Electrical', item: 'High-Voltage / 12V Auxiliary Battery Health', status: 'pass', notes: 'Optimal capacity' },
  { category: 'Battery & Electrical', item: 'Autopilot Cameras, Radar & Exterior Lights', status: 'pass', notes: 'Fully calibrated' },
  { category: 'Thermal & Cabin', item: 'Coolant Levels & Thermal Loop Integrity', status: 'pass', notes: 'Within spec' },
  { category: 'Thermal & Cabin', item: 'HEPA Cabin Microfilter & AC Evaporator', status: 'pass', notes: 'Clean airflow' },
];

export const InspectionModal = ({ isOpen, onClose, serviceRequest, onSuccess }) => {
  const { showToast } = useAuth();
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [odometer, setOdometer] = useState(serviceRequest?.odometerAtIntake || 28000);
  const [fuelLevel, setFuelLevel] = useState('3/4');
  const [advisorRemarks, setAdvisorRemarks] = useState('');
  const [recommendImmediate, setRecommendImmediate] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !serviceRequest) return null;

  const handleStatusChange = (index, newStatus) => {
    const updated = [...checklist];
    updated[index].status = newStatus;
    setChecklist(updated);
  };

  const handleNotesChange = (index, newNotes) => {
    const updated = [...checklist];
    updated[index].notes = newNotes;
    setChecklist(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createInspection({
        serviceRequestId: serviceRequest._id,
        odometerReading: Number(odometer),
        fuelLevel,
        checklist,
        advisorRemarks: advisorRemarks || 'Completed digital multi-point safety inspection.',
        recommendImmediateRepair: recommendImmediate,
      });

      if (res.success) {
        showToast('Digital vehicle inspection recorded successfully!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Search size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Digital Vehicle Inspection</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Case: <strong style={{ color: 'var(--accent-cyan)' }}>{serviceRequest.caseId}</strong> | {serviceRequest.vehicle?.year} {serviceRequest.vehicle?.make} {serviceRequest.vehicle?.model}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {/* Intake Reading */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Verified Odometer Reading (mi) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel / Battery Charge Level</label>
                <select className="form-select" value={fuelLevel} onChange={e => setFuelLevel(e.target.value)}>
                  <option value="Empty">Empty (&lt; 10%)</option>
                  <option value="1/4">1/4 (25%)</option>
                  <option value="1/2">1/2 (50%)</option>
                  <option value="3/4">3/4 (75%)</option>
                  <option value="Full">Full (100%)</option>
                </select>
              </div>
            </div>

            {/* Checklist Table */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Multi-Point Inspection Checklist
              </label>
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.2)',
              }}>
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 150px 1.5fr',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderBottom: idx !== checklist.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{item.item}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.category}</div>
                    </div>

                    {/* Status Toggles */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'pass')}
                        style={{
                          background: item.status === 'pass' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${item.status === 'pass' ? 'var(--accent-emerald)' : 'transparent'}`,
                          color: item.status === 'pass' ? '#34d399' : 'var(--text-dim)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <CheckCircle2 size={12} /> Pass
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'warning')}
                        style={{
                          background: item.status === 'warning' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${item.status === 'warning' ? 'var(--accent-amber)' : 'transparent'}`,
                          color: item.status === 'warning' ? '#fbbf24' : 'var(--text-dim)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <AlertTriangle size={12} /> Warn
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'fail')}
                        style={{
                          background: item.status === 'fail' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${item.status === 'fail' ? 'var(--accent-rose)' : 'transparent'}`,
                          color: item.status === 'fail' ? '#fb7185' : 'var(--text-dim)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <XCircle size={12} /> Fail
                      </button>
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      placeholder="Observation notes..."
                      value={item.notes}
                      onChange={e => handleNotesChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advisor Remarks */}
            <div className="form-group">
              <label className="form-label">Service Advisor Overall Diagnosis & Findings</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Diagnostic summary, recommendations for repair packages..."
                value={advisorRemarks}
                onChange={e => setAdvisorRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Inspection...' : 'Sign & Submit Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspectionModal;
