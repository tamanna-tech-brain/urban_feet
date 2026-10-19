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
  History,
  Video,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Sparkles,
  PhoneCall,
  Lock
} from 'lucide-react';
import CaseLifecycleStepper from '../components/CaseLifecycleStepper';
import EstimateApprovalModal from '../components/EstimateApprovalModal';
import InvoiceModal from '../components/InvoiceModal';
import VideoConsultationModal from '../components/VideoConsultationModal';

export const ServiceDetailView = ({
  serviceRequest,
  onBack,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    videoConsultation,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowVideoModal(true)}
            className={`btn btn-sm ${videoConsultation?.active ? 'btn-rose' : 'btn-secondary'}`}
            style={{
              gap: '0.45rem',
              fontWeight: 700,
              boxShadow: videoConsultation?.active ? '0 0 15px rgba(244, 63, 94, 0.45)' : 'none',
            }}
          >
            <Video size={14} />
            {videoConsultation?.active ? 'Join Live Video Call' : 'Live Video Consultation'}
          </button>

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

      {/* Live Video Consultation Hero Banner */}
      <div style={{
        background: videoConsultation?.active
          ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(190, 18, 60, 0.22) 100%)'
          : 'linear-gradient(135deg, rgba(16, 23, 41, 0.8) 0%, rgba(10, 15, 28, 0.9) 100%)',
        border: videoConsultation?.active ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: videoConsultation?.active ? '0 0 30px rgba(244, 63, 94, 0.2)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: videoConsultation?.active ? 'rgba(244, 63, 94, 0.25)' : 'rgba(0, 242, 254, 0.12)',
            color: videoConsultation?.active ? '#fb7185' : 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: videoConsultation?.active ? '0 0 20px rgba(244, 63, 94, 0.4)' : '0 0 15px rgba(0, 242, 254, 0.2)',
          }}>
            <Video size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>
                Live Video Consultation (WebRTC / Jitsi)
              </h3>
              {videoConsultation?.active ? (
                <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Radio size={12} /> ROOM LIVE
                </span>
              ) : videoConsultation?.status === 'completed' ? (
                <span className="badge badge-slate">Archived Meeting</span>
              ) : (
                <span className="badge badge-cyan">On-Demand Available</span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {videoConsultation?.active
                ? `Active meeting room: ${videoConsultation.roomName} • Host: ${videoConsultation.hostName} • Agenda: ${videoConsultation.agenda}`
                : `Connect advisor & customer via secure 1-click video to conduct 25-point visual walkarounds and itemized quote approvals.`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {videoConsultation?.meetingUrl && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(videoConsultation.meetingUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', fontSize: '0.775rem' }}
            >
              {copiedLink ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
              {copiedLink ? 'Copied Link' : 'Copy Video Link'}
            </button>
          )}

          <button
            onClick={() => setShowVideoModal(true)}
            className={`btn ${videoConsultation?.active ? 'btn-rose' : 'btn-primary'} btn-sm`}
            style={{ fontWeight: 700, gap: '0.45rem' }}
          >
            <Video size={15} />
            {videoConsultation?.active ? 'Enter Live Consultation' : 'Launch Video Room'}
          </button>
        </div>
      </div>

      {/* Detail Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
      }}>
        {[
          { id: 'overview', label: 'Case Overview' },
          { id: 'video', label: `Video Consultation ${videoConsultation?.active ? '🔴' : ''}` },
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

      {/* Tab: Video Consultation */}
      {activeTab === 'video' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: videoConsultation?.active ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 242, 254, 0.15)',
                color: videoConsultation?.active ? '#fb7185' : 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Video size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Live Virtual Inspection & Consultation</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Interactive WebRTC audio/video session connecting Service Advisor, Technician, and Vehicle Owner
                </p>
              </div>
            </div>

            <div>
              {videoConsultation?.active ? (
                <span className="badge badge-rose" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  <Radio size={14} /> LIVE CALL ACTIVE
                </span>
              ) : videoConsultation?.status === 'completed' ? (
                <span className="badge badge-slate" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  MEETING ARCHIVED
                </span>
              ) : (
                <span className="badge badge-cyan" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  READY TO CONNECT
                </span>
              )}
            </div>
          </div>

          {/* Consultation Details Card */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Consultation Agenda
              </span>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                {videoConsultation?.agenda || '25-Point Digital Inspection Findings & Estimate Walkthrough'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Meeting Room Security & PIN
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                  {videoConsultation?.roomName || `UrbanFleet-${caseId}`}
                </span>
                {videoConsultation?.pin && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#fff',
                  }}>
                    PIN: {videoConsultation.pin}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Host & Assigned Staff
              </span>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                {videoConsultation?.hostName || 'Sarah Jenkins (Master Service Advisor)'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Timing & Log
              </span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {videoConsultation?.startedAt 
                  ? `Initiated: ${new Date(videoConsultation.startedAt).toLocaleString()}`
                  : 'Ready on-demand whenever customer or advisor is available'}
              </div>
            </div>
          </div>

          {/* Meeting Link Bar */}
          {videoConsultation?.meetingUrl && (
            <div style={{
              background: 'rgba(12, 18, 34, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Shareable Video Meeting Link
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  color: 'var(--accent-cyan)',
                  wordBreak: 'break-all',
                }}>
                  {videoConsultation.meetingUrl}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(videoConsultation.meetingUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  {copiedLink ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>

                <a
                  href={videoConsultation.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <ExternalLink size={14} /> Open External
                </a>
              </div>
            </div>
          )}

          {/* Action Call to Action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <Lock size={14} style={{ color: 'var(--accent-emerald)' }} />
              End-to-End Encrypted Peer-to-Peer Stream • Zero Downloads Required
            </div>

            <button
              onClick={() => setShowVideoModal(true)}
              className={`btn ${videoConsultation?.active ? 'btn-rose' : 'btn-primary'}`}
              style={{ padding: '0.75rem 2rem', fontWeight: 700, gap: '0.5rem' }}
            >
              <Video size={18} />
              {videoConsultation?.active ? 'Join Live Consultation Room' : 'Start Live Consultation Now'}
            </button>
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

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        serviceRequest={serviceRequest}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default ServiceDetailView;
