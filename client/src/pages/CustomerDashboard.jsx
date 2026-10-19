import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Receipt, 
  Wrench,
  ShieldAlert,
  Video,
  Radio
} from 'lucide-react';
import CaseLifecycleStepper from '../components/CaseLifecycleStepper';
import EstimateApprovalModal from '../components/EstimateApprovalModal';
import InvoiceModal from '../components/InvoiceModal';
import VideoConsultationModal from '../components/VideoConsultationModal';

export const CustomerDashboard = ({
  vehicles,
  serviceRequests,
  onOpenRequestModal,
  onRefresh,
  onSelectCase,
}) => {
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState(null);
  const [selectedRequestForInvoice, setSelectedRequestForInvoice] = useState(null);
  const [selectedRequestForVideo, setSelectedRequestForVideo] = useState(null);

  const activeRequests = serviceRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const pastRequests = serviceRequests.filter(r => r.status === 'COMPLETED');

  // Find any request needing customer approval or active video consultation
  const pendingApprovalCase = activeRequests.find(r => r.status === 'AWAITING_APPROVAL');
  const activeVideoCase = activeRequests.find(r => r.videoConsultation?.active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Pending Approval Callout Banner (Critical Workflow Step) */}
      {pendingApprovalCase && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
          border: '1px solid var(--accent-amber)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)',
          animation: 'pulseGlow 3s infinite ease-in-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.25)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                Action Required: Estimate Ready for Approval ({pendingApprovalCase.caseId})
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fef3c7' }}>
                Your service advisor has inspected your {pendingApprovalCase.vehicle?.year} {pendingApprovalCase.vehicle?.make} {pendingApprovalCase.vehicle?.model} and provided a detailed estimate.
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedRequestForApproval(pendingApprovalCase)}
            className="btn btn-emerald"
            style={{ fontWeight: 700 }}
          >
            <FileCheck size={18} />
            Review & Authorize Estimate
          </button>
        </div>
      )}

      {/* Live Video Consultation Active Banner */}
      {activeVideoCase && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(225, 29, 72, 0.25) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.6)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 0 30px rgba(244, 63, 94, 0.25)',
          animation: 'pulseGlow 2.5s infinite ease-in-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.25)',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Video size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔴 Live Video Consultation Open ({activeVideoCase.caseId})
                <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>ROOM ACTIVE</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#ffe4e6' }}>
                Your service advisor {activeVideoCase.videoConsultation?.hostName || 'Sarah Jenkins'} has opened the live vehicle walkaround room.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedRequestForVideo(activeVideoCase)}
              className="btn btn-rose"
              style={{ fontWeight: 700, gap: '0.5rem' }}
            >
              <Video size={16} />
              Join Live Video Call
            </button>
          </div>
        </div>
      )}

      {/* Vehicles Overview Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>My Registered Fleet Vehicles</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Individual customer vehicle telemetry and servicing history
            </p>
          </div>

          <button
            onClick={onOpenRequestModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Raise Service Request
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {vehicles.map(v => (
            <div key={v._id} className="glass-card glass-card-interactive">
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Car size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>
                      {v.year} {v.make} {v.model}
                    </h3>
                    <div style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      marginTop: '0.1rem',
                    }}>
                      Plate: {v.licensePlate}
                    </div>
                  </div>
                </div>

                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {v.fuelType}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
              }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Odometer</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{v.mileage?.toLocaleString()} mi</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Color</div>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{v.color}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={onOpenRequestModal}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  <Wrench size={14} /> Schedule Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Service Requests (Case Management Tracking) */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Active Service Cases</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            End-to-end tracking of vehicle inspection, advisor estimates, and technician repairs
          </p>
        </div>

        {activeRequests.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Car size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>No active service requests</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
              Your fleet is in top shape! Raise a request whenever periodic maintenance is due.
            </p>
            <button onClick={onOpenRequestModal} className="btn btn-primary btn-sm">
              Book Vehicle Service
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activeRequests.map(req => (
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
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'var(--accent-cyan)',
                        background: 'rgba(0, 242, 254, 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                      }}>
                        {req.caseId}
                      </span>
                      <h3 style={{ fontSize: '1.15rem' }}>{req.serviceType}</h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Vehicle: <strong>{req.vehicle?.year} {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.licensePlate})</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedRequestForVideo(req)}
                      className={`btn btn-sm ${req.videoConsultation?.active ? 'btn-rose' : 'btn-secondary'}`}
                      style={{ gap: '0.4rem', fontSize: '0.775rem' }}
                      title="Launch or join live video consultation"
                    >
                      <Video size={13} />
                      {req.videoConsultation?.active ? 'Join Live Video' : 'Video Call'}
                    </button>

                    {req.status === 'AWAITING_APPROVAL' && (
                      <button
                        onClick={() => setSelectedRequestForApproval(req)}
                        className="btn btn-emerald btn-sm"
                      >
                        <FileCheck size={14} /> Review Estimate
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCase(req)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Case Timeline <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Case Lifecycle Stepper */}
                <CaseLifecycleStepper
                  currentStage={req.currentStage}
                  status={req.status}
                  slaDeadline={req.slaDeadline}
                />

                {/* Service Center & Symptoms */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.8rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Service Center</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{req.serviceCenter?.name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Assigned Advisor</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{req.assignedAdvisor?.name || 'Pending Intake'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Assigned Technician</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{req.assignedTechnician?.name || 'Pending Work Order'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Service History */}
      {pastRequests.length > 0 && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Completed Service History</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Verified vehicle service records and official tax invoices
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastRequests.map(req => (
              <div
                key={req._id}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {req.caseId} - {req.serviceType}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.vehicle?.make} {req.vehicle?.model} • Completed on {new Date(req.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedRequestForInvoice(req)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Receipt size={14} /> View Invoice
                  </button>
                  <button
                    onClick={() => onSelectCase(req)}
                    className="btn btn-secondary btn-sm"
                  >
                    Case Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EstimateApprovalModal
        isOpen={Boolean(selectedRequestForApproval)}
        onClose={() => setSelectedRequestForApproval(null)}
        serviceRequest={selectedRequestForApproval}
        onSuccess={onRefresh}
      />

      <InvoiceModal
        isOpen={Boolean(selectedRequestForInvoice)}
        onClose={() => setSelectedRequestForInvoice(null)}
        serviceRequest={selectedRequestForInvoice}
      />

      <VideoConsultationModal
        isOpen={Boolean(selectedRequestForVideo)}
        onClose={() => setSelectedRequestForVideo(null)}
        serviceRequest={selectedRequestForVideo}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default CustomerDashboard;
