import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Play, 
  ShieldCheck, 
  FileText, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import CaseLifecycleStepper from '../components/CaseLifecycleStepper';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TechnicianDashboard = ({
  serviceRequests,
  onRefresh,
  onSelectCase,
}) => {
  const { currentUser, showToast } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  // Filter cases assigned to current technician or ready for technician work
  const bayWorkOrders = serviceRequests.filter(
    r => ['ASSIGNED', 'IN_PROGRESS', 'QUALITY_CHECK'].includes(r.status)
  );

  const toggleTask = (caseId, taskIdx) => {
    const key = `${caseId}_${taskIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStartWork = async (caseItem) => {
    setLoadingId(caseItem._id);
    try {
      const res = await api.updateTechnicianProgress(caseItem._id, {
        status: 'IN_PROGRESS',
        notes: `Technician ${currentUser?.name} initiated service execution in Bay 3.`,
      });
      if (res.success) {
        showToast(`Service execution initiated for Case ${caseItem.caseId}!`);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSubmitForQA = async (caseItem) => {
    setLoadingId(caseItem._id);
    try {
      const res = await api.updateTechnicianProgress(caseItem._id, {
        status: 'QUALITY_CHECK',
        notes: `All work order items and parts replacement completed by ${currentUser?.name}. Ready for road test QA.`,
      });
      if (res.success) {
        showToast(`Case ${caseItem.caseId} submitted for Advisor Quality Check!`);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem' }}>Master Technician Service Bay Workbench</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Active vehicle work orders, physical service execution tracking, and QA dispatch
        </p>
      </div>

      {bayWorkOrders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Wrench size={38} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>All Assigned Bay Bays Clear</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            No active work orders currently assigned to your bay. New approved requests will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bayWorkOrders.map(req => {
            const isAssigned = req.status === 'ASSIGNED';
            const isInProgress = req.status === 'IN_PROGRESS';
            const isQA = req.status === 'QUALITY_CHECK';

            // Tasks based on estimate items or default maintenance checklist
            const taskItems = req.estimate?.items || [
              { description: 'Comprehensive 25-point safety inspection & torque verification' },
              { description: 'Fluid replacement and thermal loop check' },
              { description: 'Brake pads, rotors & caliper cleaning' },
              { description: 'High-voltage diagnostic telemetry scan' },
            ];

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-indigo)',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}>
                        {req.caseId}
                      </span>
                      <h3 style={{ fontSize: '1.15rem' }}>{req.serviceType}</h3>
                      <span className={`badge ${isQA ? 'badge-amber' : isInProgress ? 'badge-cyan' : 'badge-purple'}`}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Vehicle: <strong>{req.vehicle?.year} {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.licensePlate})</strong> • Mileage: {req.odometerAtIntake?.toLocaleString()} mi
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isAssigned && (
                      <button
                        onClick={() => handleStartWork(req)}
                        disabled={loadingId === req._id}
                        className="btn btn-primary btn-sm"
                      >
                        <Play size={14} /> Start Service Execution
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleSubmitForQA(req)}
                        disabled={loadingId === req._id}
                        className="btn btn-emerald btn-sm"
                      >
                        <ShieldCheck size={14} /> Submit for Quality Check
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCase(req)}
                      className="btn btn-secondary btn-sm"
                    >
                      Case Timeline <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <CaseLifecycleStepper
                  currentStage={req.currentStage}
                  status={req.status}
                  slaDeadline={req.slaDeadline}
                  isCompact={true}
                />

                {/* Work Order Tasks Checklist */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginTop: '0.5rem',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>Authorized Work Order Checklist</span>
                    <span>Click to check off completed items</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {taskItems.map((item, idx) => {
                      const isDone = completedTasks[`${req._id}_${idx}`] || isQA;
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleTask(req._id, idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(isDone)}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
                          />
                          <span style={{
                            fontSize: '0.85rem',
                            color: isDone ? '#94a3b8' : '#e2e8f0',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {item.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
