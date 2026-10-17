import React, { useState } from 'react';
import { X, FileSpreadsheet, Plus, Trash2, DollarSign, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EstimateModal = ({ isOpen, onClose, serviceRequest, onSuccess }) => {
  const { showToast } = useAuth();
  const [items, setItems] = useState([
    { type: 'part', description: 'Factory OEM Replacement Parts Pack', quantity: 1, unitPrice: 180 },
    { type: 'labor', description: 'Technician Bay Labor & Calibration', quantity: 1.5, unitPrice: 120 },
    { type: 'diagnostic', description: 'Digital Multi-Point Diagnostics & Road Test', quantity: 1, unitPrice: 65 },
  ]);
  const [discount, setDiscount] = useState(25);
  const [estimatedHours, setEstimatedHours] = useState(2.5);
  const [advisorNotes, setAdvisorNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !serviceRequest) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { type: 'part', description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => {
    const q = Number(curr.quantity) || 0;
    const p = Number(curr.unitPrice) || 0;
    return acc + q * p;
  }, 0);

  const taxRate = 8.5;
  const taxable = Math.max(0, subtotal - (Number(discount) || 0));
  const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length || items.some(i => !i.description.trim())) {
      showToast('Please provide a description for all estimate line items', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createEstimate({
        serviceRequestId: serviceRequest._id,
        items,
        discount: Number(discount) || 0,
        estimatedHours: Number(estimatedHours) || 2.0,
        advisorNotes,
      });

      if (res.success) {
        showToast(`Estimate of $${totalAmount.toFixed(2)} dispatched to customer for digital approval!`);
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
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Create Service Cost Estimate</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Case: <strong style={{ color: 'var(--accent-cyan)' }}>{serviceRequest.caseId}</strong> | {serviceRequest.serviceType}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {/* Dynamic Items Builder */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label">Itemized Parts, Labor & Diagnostic Fees</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.2)',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 2.5fr 70px 100px 90px 40px',
                  gap: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                }}>
                  <div>Type</div>
                  <div>Description</div>
                  <div>Qty/Hrs</div>
                  <div>Unit Rate ($)</div>
                  <div>Total ($)</div>
                  <div></div>
                </div>

                {items.map((item, idx) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 2.5fr 70px 100px 90px 40px',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.5rem 0.85rem',
                        borderBottom: idx !== items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={item.type}
                        onChange={e => handleItemChange(idx, 'type', e.target.value)}
                      >
                        <option value="part">Part</option>
                        <option value="labor">Labor</option>
                        <option value="diagnostic">Diagnostic</option>
                        <option value="fee">Fee</option>
                      </select>

                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        placeholder="e.g. Brake Pads, Transmission Flush..."
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        required
                      />

                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        className="form-input"
                        style={{ padding: '0.35rem 0.4rem', fontSize: '0.8rem', textAlign: 'center' }}
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                      />

                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        required
                      />

                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                      }}>
                        ${lineTotal.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: items.length <= 1 ? 'var(--text-dim)' : '#f87171',
                          cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Estimated Service Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={estimatedHours}
                    onChange={e => setEstimatedHours(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Advisor Notes / Warranty Terms</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Parts warranty coverage details, turnaround expectations..."
                    value={advisorNotes}
                    onChange={e => setAdvisorNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Price Ledger Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Promo Discount ($):</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '80px', padding: '0.2rem 0.5rem', textAlign: 'right', fontSize: '0.85rem' }}
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Tax ({taxRate}%):</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${taxAmount.toFixed(2)}</span>
                </div>

                <div style={{
                  borderTop: '1px dashed var(--border-medium)',
                  paddingTop: '0.65rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Total Estimate:</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    color: 'var(--accent-cyan)',
                  }}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Send Estimate for Customer Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstimateModal;
