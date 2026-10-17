import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, FileText, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EstimateApprovalModal = ({ isOpen, onClose, serviceRequest, onSuccess }) => {
  const { currentUser, showToast } = useAuth();
  const [signature, setSignature] = useState(currentUser?.name || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !serviceRequest || !serviceRequest.estimate) return null;

  const estimate = serviceRequest.estimate;

  const handleDecision = async (decision) => {
    if (decision === 'approved' && !signature.trim()) {
      showToast('Please provide your digital signature/name to approve', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitEstimateDecision(estimate._id, {
        decision,
        customerSignature: signature,
        customerNotes,
      });

      if (res.success) {
        showToast(
          decision === 'approved'
            ? 'Estimate approved! Work order dispatched to service technician.'
            : 'Estimate declined. Service advisor notified.',
          decision === 'approved' ? 'info' : 'warning'
        );
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
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Review & Authorize Service Estimate</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stage 3: Customer Consent & Digital Approval
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Case ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {serviceRequest.caseId}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Vehicle</div>
              <div style={{ fontWeight: 600, color: '#fff' }}>
                {serviceRequest.vehicle?.year} {serviceRequest.vehicle?.make} {serviceRequest.vehicle?.model}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Estimated Turnaround</div>
              <div style={{ fontWeight: 600, color: '#38bdf8' }}>
                ~{estimate.estimatedHours || 2.5} Hours
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 60px 80px 90px',
              padding: '0.55rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.04)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              <div>Type</div>
              <div>Description</div>
              <div>Qty</div>
              <div>Rate</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>

            {estimate.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 60px 80px 90px',
                  padding: '0.65rem 0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span className={`badge ${item.type === 'part' ? 'badge-cyan' : item.type === 'labor' ? 'badge-purple' : 'badge-slate'}`} style={{ fontSize: '0.65rem' }}>
                    {item.type}
                  </span>
                </div>
                <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.description}</div>
                <div style={{ color: 'var(--text-muted)' }}>{item.quantity}</div>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>${item.unitPrice}</div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  ${(item.total || item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}

            {/* Subtotal & Total Row */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.85rem 1rem',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${estimate.subtotal?.toFixed(2)}</span>
              </div>
              {estimate.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#34d399' }}>
                  <span>Promo Discount:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>-${estimate.discount?.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Taxes & Environmental Compliance ({estimate.taxRate}%):</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${estimate.taxAmount?.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#fff',
                borderTop: '1px dashed var(--border-subtle)',
                paddingTop: '0.5rem',
                marginTop: '0.2rem',
              }}>
                <span>Total Authorized Amount:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  ${estimate.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Consent */}
          <div style={{
            background: 'rgba(0, 242, 254, 0.03)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              By digitally signing below, you authorize Urban Fleet Operations to perform the specified diagnostic, repair, and parts replacement operations in accordance with fleet warranty standards.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Digital Signature / Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                  placeholder="e.g. Johnathan Vance"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Comments (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Please call me when brakes are ready"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleDecision('rejected')}
            disabled={loading}
          >
            <XCircle size={16} /> Decline Estimate
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-emerald"
              onClick={() => handleDecision('approved')}
              disabled={loading}
            >
              <CheckCircle2 size={16} /> {loading ? 'Authorizing...' : 'Approve & Authorize Work'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateApprovalModal;
