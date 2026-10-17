import React from 'react';
import { X, Printer, CheckCircle, Car, Shield, Award } from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, serviceRequest }) => {
  if (!isOpen || !serviceRequest) return null;

  const estimate = serviceRequest.estimate;
  const total = estimate ? estimate.totalAmount : 340.0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px', background: '#0b1120' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Award size={22} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Official Service Invoice & Settlement</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Case {serviceRequest.caseId}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          {/* Invoice Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '1.5rem',
          }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                URBAN FLEET <span style={{ color: 'var(--accent-cyan)' }}>OPERATIONS</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {serviceRequest.serviceCenter?.name || 'Downtown Fleet Hub'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {serviceRequest.serviceCenter?.address || '450 Innovation Parkway'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}>
                <CheckCircle size={14} /> PAID IN FULL
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                INV-2026-{serviceRequest.caseId.replace('SR-', '')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Vehicle & Customer details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            margin: '1.5rem 0',
            fontSize: '0.85rem',
          }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Billed To:
              </div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{serviceRequest.customer?.name || 'Customer'}</div>
              <div style={{ color: 'var(--text-muted)' }}>{serviceRequest.customer?.email}</div>
              <div style={{ color: 'var(--text-muted)' }}>{serviceRequest.customer?.phone}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Serviced Vehicle:
              </div>
              <div style={{ fontWeight: 700, color: '#fff' }}>
                {serviceRequest.vehicle?.year} {serviceRequest.vehicle?.make} {serviceRequest.vehicle?.model}
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                Plate: {serviceRequest.vehicle?.licensePlate} | VIN: {serviceRequest.vehicle?.vin || 'N/A'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Odometer at Service: {serviceRequest.odometerAtIntake?.toLocaleString()} miles
              </div>
            </div>
          </div>

          {/* Items breakdown */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 90px',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              <div>Description</div>
              <div style={{ textAlign: 'center' }}>Qty</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
            </div>

            {estimate?.items ? (
              estimate.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 70px 90px',
                    padding: '0.65rem 1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ color: '#e2e8f0' }}>{it.description}</div>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{it.quantity}</div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    ${(it.total || it.quantity * it.unitPrice).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', padding: '0.65rem 1rem', fontSize: '0.8rem' }}>
                <div>Comprehensive 25,000-Mile Scheduled Service & Road Test</div>
                <div style={{ textAlign: 'center' }}>1</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$340.00</div>
              </div>
            )}

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>Total Settled:</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: 'var(--accent-cyan)',
              }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Official Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
