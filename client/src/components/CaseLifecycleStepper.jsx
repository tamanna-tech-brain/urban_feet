import React from 'react';
import { 
  ClipboardList, 
  Search, 
  FileCheck2, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const STAGES = [
  { id: 'Request Intake', label: '1. Request Intake', icon: ClipboardList, desc: 'Customer service request & check-in' },
  { id: 'Inspection & Estimate', label: '2. Inspection & Estimate', icon: Search, desc: '25-Point vehicle inspection & quote' },
  { id: 'Customer Approval', label: '3. Customer Approval', icon: FileCheck2, desc: 'Digital quote review & signoff' },
  { id: 'Service Execution', label: '4. Service Execution', icon: Wrench, desc: 'Technician bay repair & parts overhaul' },
  { id: 'Quality Check & Pickup', label: '5. Quality Check', icon: ShieldCheck, desc: 'Road test & delivery handover' },
  { id: 'Resolved', label: '6. Resolved', icon: CheckCircle2, desc: 'Vehicle delivered & invoice settled' },
];

export const CaseLifecycleStepper = ({ currentStage, status, slaDeadline, isCompact = false }) => {
  const currentIdx = STAGES.findIndex(s => s.id === currentStage);
  const isRejected = status === 'REJECTED';
  const isCompleted = status === 'COMPLETED';

  // SLA Calculation
  const getSlaRemaining = () => {
    if (!slaDeadline) return null;
    const diff = new Date(slaDeadline) - new Date();
    if (diff <= 0) return { text: 'SLA Overdue', isOverdue: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}h ${mins}m remaining`, isOverdue: false };
  };

  const sla = getSlaRemaining();

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: isCompact ? '1rem 1.25rem' : '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isCompact ? '0.75rem' : '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <span className="pulse-indicator pulse-blue" />
            Pega Case Lifecycle
          </span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Stage: <strong style={{ color: '#fff' }}>{currentStage}</strong>
          </span>
        </div>

        {sla && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: sla.isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${sla.isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            color: sla.isOverdue ? '#f87171' : '#34d399',
            fontWeight: 600,
          }}>
            <Clock size={12} />
            {sla.text}
          </div>
        )}
      </div>

      {/* Stepper Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
        gap: '0.5rem',
        position: 'relative',
      }}>
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = currentIdx > idx || isCompleted;
          const isCurrent = currentIdx === idx && !isCompleted;
          const isPending = currentIdx < idx;

          let stepBg = 'rgba(255, 255, 255, 0.02)';
          let borderColor = 'var(--border-subtle)';
          let iconColor = 'var(--text-dim)';
          let textColor = 'var(--text-dim)';

          if (isDone) {
            stepBg = 'rgba(16, 185, 129, 0.08)';
            borderColor = 'rgba(16, 185, 129, 0.35)';
            iconColor = 'var(--accent-emerald)';
            textColor = '#e2e8f0';
          } else if (isCurrent) {
            if (isRejected && stage.id === 'Customer Approval') {
              stepBg = 'rgba(244, 63, 94, 0.15)';
              borderColor = 'rgba(244, 63, 94, 0.5)';
              iconColor = '#fb7185';
              textColor = '#fff';
            } else {
              stepBg = 'rgba(0, 242, 254, 0.09)';
              borderColor = 'var(--accent-cyan)';
              iconColor = 'var(--accent-cyan)';
              textColor = '#fff';
            }
          }

          return (
            <div
              key={stage.id}
              style={{
                background: stepBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: isCompact ? '0.65rem 0.5rem' : '0.85rem 0.65rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                boxShadow: isCurrent ? '0 0 15px rgba(0, 242, 254, 0.15)' : 'none',
              }}
            >
              <div style={{
                width: isCompact ? '28px' : '34px',
                height: isCompact ? '28px' : '34px',
                borderRadius: '50%',
                background: isCurrent ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
                marginBottom: '0.4rem',
              }}>
                <Icon size={isCompact ? 14 : 17} />
              </div>

              <div style={{
                fontSize: isCompact ? '0.7rem' : '0.75rem',
                fontWeight: isCurrent ? 700 : 600,
                color: textColor,
                lineHeight: 1.2,
                marginBottom: '0.2rem',
              }}>
                {stage.label}
              </div>

              {!isCompact && (
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {stage.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseLifecycleStepper;
