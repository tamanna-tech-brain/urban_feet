import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Car, 
  User, 
  MapPin, 
  Calendar, 
  FileCheck2, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Receipt,
  Shield,
  History
} from 'lucide-react';
import CaseLifecycleStepper from '../components/CaseLifecycleStepper';
import EstimateApprovalModal from '../components/EstimateApprovalModal';
import InvoiceModal from '../components/InvoiceModal';

export const ServiceDetailView = ({
  serviceRequest,
  onBack,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  if (!serviceRequest) return null;

  const {
    caseId,
    serviceType,
    customer,
    vehicle,
    serviceCenter,
    preferredDate,
    currentStage,
    status,
    slaDeadline,
    odometerAtIntake,
    primaryConcerns,
    inspection,
    estimate,
    timeline = [],
  } = serviceRequest;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation & Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
              }}>
                {caseId}
              </span>
              <h2 style={{ fontSize: '1.25rem' }}>{serviceType}</h2>
              <span className={`badge ${
                status === 'COMPLETED' ? 'badge-emerald' :
                status === 'AWAITING_APPROVAL' ? 'badge-amber' :
                status === 'REJECTED' ? 'badge-rose' : 'badge-cyan'
              }`}>
                {status}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Logged on {new Date(serviceRequest.createdAt).toLocaleDateString()} • SLA Target: 24h
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {status === 'AWAITING_APPROVAL' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="btn btn-emerald btn-sm"
            >
              <FileCheck2 size={14} /> Review & Approve Estimate
            </button>
          )}

          {status === 'COMPLETED' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Receipt size={14} /> Official Invoice
            </button>
          )}
        </div>
      </div>

      {/* Case Lifecycle Stepper */}
      <CaseLifecycleStepper
        currentStage={currentStage}
        status={status}
        slaDeadline={slaDeadline}
      />

      {/* Detail Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
      }}>
        {[
          { id: 'overview', label: 'Case Overview' },
          { id: 'inspection', label: `Digital Inspection (${inspection ? 'Completed' : 'Pending'})` },
          { id: 'estimate', label: `Cost Estimate (${estimate ? '$' + estimate.totalAmount?.toFixed(2) : 'Pending'})` },
          { id: 'timeline', label: `Audit Timeline (${timeline.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              padding: '0.5rem 1rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Vehicle & Customer Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={18} style={{ color: 'var(--accent-cyan)' }} /> Vehicle & Fleet Metadata
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Vehicle</span>
                <strong style={{ color: '#fff' }}>{vehicle?.year} {vehicle?.make} {vehicle?.model}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>License Plate</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{vehicle?.licensePlate}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Fuel / Powertrain</span>
                  <span>{vehicle?.fuelType}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Odometer at Intake</span>
                  <span>{odometerAtIntake?.toLocaleString()} miles</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>VIN</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{vehicle?.vin || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Location Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--accent-cyan)' }} /> Customer & Service Center
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Customer Name</span>
                <strong style={{ color: '#fff' }}>{customer?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Contact Information</span>
                <span>{customer?.email} • {customer?.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Fleet Service Center</span>
                <strong style={{ color: '#fff' }}>{serviceCenter?.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{serviceCenter?.address}, {serviceCenter?.city}</div>
              </div>
            </div>
          </div>

          {/* Symptoms & Primary Concerns */}
          <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Customer Reported Symptoms & Work Scope</h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              color: '#e2e8f0',
              lineHeight: 1.5,
            }}>
              {primaryConcerns}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inspection */}
      {activeTab === 'inspection' && (
        <div className="glass-card">
          {!inspection ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No inspection recorded for this case yet. Service Advisor will conduct the 25-point inspection shortly.
            </div>
          ) : (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Multi-Point Digital Inspection Findings</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Odometer: {inspection.odometerReading?.toLocaleString()} mi • Fuel Level: {inspection.fuelLevel}
                  </p>
                </div>
                {inspection.recommendImmediateRepair && (
                  <span className="badge badge-amber">
                    <AlertTriangle size={12} /> Immediate Attention Recommended
                  </span>
                )}
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {inspection.checklist?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: idx !== inspection.checklist.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{item.item}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}: {item.notes}</div>
                    </div>
                    <div>
                      <span className={`badge ${
                        item.status === 'pass' ? 'badge-emerald' :
                        item.status === 'warning' ? 'badge-amber' : 'badge-rose'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {inspection.advisorRemarks && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Inspector Notes:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{inspection.advisorRemarks}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Estimate */}
      {activeTab === 'estimate' && (
        <div className="glass-card">
          {!estimate ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No estimate generated yet. Service Advisor will prepare an itemized quote following the vehicle inspection.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Itemized Cost Estimate & Customer Consent</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Decision: <strong style={{ color: estimate.customerDecision === 'approved' ? '#34d399' : '#f87171' }}>
                      {estimate.customerDecision.toUpperCase()}
                    </strong>
                    {estimate.customerSignature && ` • Signed: ${estimate.customerSignature}`}
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  ${estimate.totalAmount?.toFixed(2)}
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 60px 80px 90px',
                  padding: '0.5rem 1rem',
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

                {estimate.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 60px 80px 90px',
                      padding: '0.65rem 1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span className={`badge ${it.type === 'part' ? 'badge-cyan' : it.type === 'labor' ? 'badge-purple' : 'badge-slate'}`} style={{ fontSize: '0.65rem' }}>
                        {it.type}
                      </span>
                    </div>
                    <div style={{ color: '#e2e8f0' }}>{it.description}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{it.quantity}</div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>${it.unitPrice}</div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      ${(it.total || it.quantity * it.unitPrice).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.85rem 1rem',
                  borderTop: '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>${estimate.subtotal?.toFixed(2)}</span>
                  </div>
                  {estimate.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                      <span>Discount:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>-${estimate.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Estimated Tax ({estimate.taxRate}%):</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>${estimate.taxAmount?.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#fff',
                    borderTop: '1px dashed var(--border-subtle)',
                    paddingTop: '0.4rem',
                    marginTop: '0.2rem',
                  }}>
                    <span>Total Estimate:</span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      ${estimate.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Timeline */}
      {activeTab === 'timeline' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} style={{ color: 'var(--accent-cyan)' }} /> Case Lifecycle Audit Trail
          </h3>

          <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            <div style={{
              position: 'absolute',
              left: '7px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'var(--border-medium)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: idx === timeline.length - 1 ? 'var(--accent-cyan)' : '#334155',
                    border: '2px solid #0f172a',
                    boxShadow: idx === timeline.length - 1 ? '0 0 10px var(--accent-cyan)' : 'none',
                  }} />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>
                        {event.action}
                      </span>
                      <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                        {event.stage}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Performed by <strong style={{ color: '#cbd5e1' }}>{event.performedBy}</strong> • {new Date(event.timestamp).toLocaleString()}
                    </div>

                    {event.notes && (
                      <div style={{
                        marginTop: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-dim)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                      }}>
                        {event.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EstimateApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        serviceRequest={serviceRequest}
        onSuccess={onRefresh}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        serviceRequest={serviceRequest}
      />
    </div>
  );
};

export default ServiceDetailView;
