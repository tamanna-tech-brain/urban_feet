import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  PhoneOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Sidebar, 
  ShieldCheck, 
  AlertTriangle, 
  Receipt, 
  Sparkles,
  Lock,
  Clock,
  Radio,
  FileCheck2,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const VideoConsultationModal = ({
  isOpen,
  onClose,
  serviceRequest,
  onSuccess,
}) => {
  const { currentUser, showToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showCopilot, setShowCopilot] = useState(true);
  const [copilotTab, setCopilotTab] = useState('inspection'); // 'inspection' | 'estimate'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState('25-Point Digital Inspection Findings & Estimate Walkthrough');

  const video = serviceRequest?.videoConsultation;
  const isCallActive = video?.active && video?.status === 'live';

  // Live timer effect
  useEffect(() => {
    let timer;
    if (isCallActive) {
      const startTime = video.startedAt ? new Date(video.startedAt).getTime() : Date.now();
      timer = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setElapsedSeconds(diff);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive, video?.startedAt]);

  if (!isOpen || !serviceRequest) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    if (!video?.meetingUrl) return;
    navigator.clipboard.writeText(video.meetingUrl);
    setCopied(true);
    showToast('Meeting link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartConsultation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createVideoConsultation(serviceRequest._id, {
        agenda: selectedAgenda,
      });
      if (res.success) {
        showToast('Live Video Consultation room initiated!');
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!window.confirm('Are you sure you want to end this live video consultation?')) return;
    setLoading(true);
    try {
      const res = await api.endVideoConsultation(serviceRequest._id);
      if (res.success) {
        showToast('Live consultation concluded and archived to case history.');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayName = encodeURIComponent(
    `${currentUser?.name || 'Participant'} (${currentUser?.role?.toUpperCase() || 'USER'})`
  );
  
  // Clean Jitsi URL with pre-configured settings
  const iframeUrl = video?.meetingUrl
    ? `${video.meetingUrl}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=false&config.disableDeepLinking=true`
    : '';

  return (
    <div 
      className="modal-overlay" 
      style={{
        zIndex: 1100,
        padding: isFullscreen ? 0 : '1.5rem',
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(5, 8, 16, 0.88)'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          width: isFullscreen ? '100vw' : '96vw',
          maxWidth: isFullscreen ? '100vw' : '1360px',
          height: isFullscreen ? '100vh' : '90vh',
          borderRadius: isFullscreen ? 0 : 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          background: 'linear-gradient(180deg, #0c1222 0%, #080d19 100%)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 254, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: 'rgba(12, 18, 34, 0.95)',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Left Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isCallActive ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' : 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isCallActive ? '0 0 20px rgba(244, 63, 94, 0.45)' : '0 0 20px rgba(0, 242, 254, 0.35)',
            }}>
              <Video size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.01em',
                  color: '#fff',
                }}>
                  Live Video Consultation
                </span>

                {isCallActive ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(244, 63, 94, 0.18)',
                    color: '#fb7185',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#f43f5e',
                      boxShadow: '0 0 8px #f43f5e',
                      animation: 'pulseGlow 1.5s infinite ease-in-out',
                    }} />
                    LIVE • {formatTimer(elapsedSeconds)}
                  </span>
                ) : (
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                    READY TO LAUNCH
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Case: <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{serviceRequest.caseId}</strong></span>
                <span>•</span>
                <span>{serviceRequest.vehicle?.year} {serviceRequest.vehicle?.make} {serviceRequest.vehicle?.model}</span>
                <span>•</span>
                <span style={{ color: '#cbd5e1' }}>Plate: {serviceRequest.vehicle?.licensePlate}</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isCallActive && (
              <>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary btn-sm"
                  title="Copy consultation invite link"
                  style={{ gap: '0.4rem', fontSize: '0.775rem' }}
                >
                  {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied Link!' : 'Copy Link'}
                </button>

                <a
                  href={video?.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  title="Open video call in separate full-screen browser window"
                  style={{ gap: '0.4rem', fontSize: '0.775rem' }}
                >
                  <ExternalLink size={14} /> Pop-out Window
                </a>

                <button
                  onClick={() => setShowCopilot(!showCopilot)}
                  className={`btn btn-sm ${showCopilot ? 'btn-cyan' : 'btn-secondary'}`}
                  title="Toggle 25-Point Inspection and Cost Estimate side panel"
                  style={{ gap: '0.4rem', fontSize: '0.775rem' }}
                >
                  <Sidebar size={14} />
                  Co-Pilot {showCopilot ? 'Open' : 'Hidden'}
                </button>

                <button
                  onClick={handleEndCall}
                  className="btn btn-sm"
                  disabled={loading}
                  style={{
                    background: 'rgba(244, 63, 94, 0.2)',
                    color: '#fb7185',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    gap: '0.4rem',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                  }}
                >
                  <PhoneOff size={14} /> End Call
                </button>
              </>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem' }}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Video Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: '#040711',
          }}>
            {isCallActive ? (
              <>
                {/* Meeting Header Bar Inside Video */}
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(8, 13, 25, 0.9)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#e2e8f0' }}>
                      <Lock size={12} style={{ color: 'var(--accent-emerald)' }} />
                      Encrypted Room: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{video?.roomName}</strong>
                    </span>
                    <span>•</span>
                    <span>PIN: <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{video?.pin}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                    <span>Agenda: <strong style={{ color: '#fff' }}>{video?.agenda}</strong></span>
                    <span>•</span>
                    <span>Host: <strong style={{ color: 'var(--accent-amber)' }}>{video?.hostName}</strong></span>
                  </div>
                </div>

                {/* Embedded Video Iframe */}
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#050811' }}>
                  <iframe
                    src={iframeUrl}
                    title="Live Video Consultation"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: '#070a12',
                    }}
                  />

                  {/* Fallback floating button if browser blocks iframe WebRTC */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    zIndex: 20,
                    background: 'rgba(10, 15, 26, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.725rem',
                  }}>
                    <Radio size={12} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Camera/Mic not connecting in iframe?</span>
                    <a
                      href={video?.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-cyan)', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      Open in External Tab
                    </a>
                  </div>
                </div>
              </>
            ) : (
              /* Pre-call Launcher Setup Screen */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.25) 100%)',
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                  marginBottom: '1.5rem',
                  boxShadow: '0 0 35px rgba(0, 242, 254, 0.25)',
                }}>
                  <Video size={40} />
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Start Live Video Consultation
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  maxWidth: '520px',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                }}>
                  Generate an instant, secure video meeting room for <strong>Case {serviceRequest.caseId}</strong>.
                  Both the Customer and Service Advisor can join simultaneously to review multi-point vehicle inspection footage and approve repair estimates in real-time.
                </p>

                <div style={{
                  width: '100%',
                  maxWidth: '520px',
                  background: 'rgba(16, 23, 41, 0.75)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'left',
                  marginBottom: '2rem',
                }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                    Select Consultation Agenda
                  </label>
                  <select
                    className="form-select"
                    value={selectedAgenda}
                    onChange={e => setSelectedAgenda(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                  >
                    <option value="25-Point Digital Inspection Findings & Estimate Walkthrough">
                      🔍 25-Point Digital Inspection Findings & Estimate Walkthrough
                    </option>
                    <option value="Customer Estimate Authorization & Scope Negotiation">
                      💰 Customer Estimate Authorization & Scope Negotiation
                    </option>
                    <option value="Master Technician Live Bay Diagnostics & Telemetry Review">
                      🔧 Master Technician Live Bay Diagnostics & Telemetry Review
                    </option>
                    <option value="Post-Service QA Signoff & Contactless Vehicle Handover">
                      🚗 Post-Service QA Signoff & Contactless Vehicle Handover
                    </option>
                  </select>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}>
                    <div>⚡ <strong>Zero Installs:</strong> Runs directly inside the browser using secure WebRTC.</div>
                    <div>🔔 <strong>Automated Alerts:</strong> System automatically notifies the customer with the 1-click meeting URL.</div>
                    <div>📋 <strong>Integrated Co-Pilot:</strong> View inspection findings & line-item costs side-by-side with video.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartConsultation}
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ fontWeight: 700, padding: '0.75rem 2rem', gap: '0.5rem' }}
                  >
                    <Video size={18} />
                    {loading ? 'Initializing Meeting Room...' : 'Launch Live Video Room'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Co-Pilot Drawer (Inspection & Estimate live review during call) */}
          {showCopilot && (
            <div style={{
              width: '380px',
              borderLeft: '1px solid var(--border-medium)',
              background: '#090e1c',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Co-pilot Tab Header */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(12, 17, 32, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 800 }}>
                  <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                  Consultation Co-Pilot
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => setCopilotTab('inspection')}
                    style={{
                      background: copilotTab === 'inspection' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                      color: copilotTab === 'inspection' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Inspection
                  </button>
                  <button
                    onClick={() => setCopilotTab('estimate')}
                    style={{
                      background: copilotTab === 'estimate' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                      color: copilotTab === 'estimate' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Estimate
                  </button>
                </div>
              </div>

              {/* Co-Pilot Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {copilotTab === 'inspection' ? (
                  <div>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                        25-Point Safety Findings
                      </span>
                      {serviceRequest.inspection ? (
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Completed</span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Pending</span>
                      )}
                    </div>

                    {!serviceRequest.inspection ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Inspection pending. Advisor can discuss customer symptoms online.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {serviceRequest.inspection.checklist?.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.65rem 0.8rem',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.775rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <strong style={{ color: '#fff' }}>{item.item}</strong>
                              <span className={`badge ${
                                item.status === 'pass' ? 'badge-emerald' :
                                item.status === 'warning' ? 'badge-amber' : 'badge-rose'
                              }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                {item.status.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                              {item.category} • {item.notes}
                            </div>
                          </div>
                        ))}

                        {serviceRequest.inspection.advisorRemarks && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(0, 242, 254, 0.05)',
                            border: '1px solid rgba(0, 242, 254, 0.2)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                          }}>
                            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.2rem' }}>
                              Inspector Diagnosis:
                            </div>
                            <div style={{ color: '#cbd5e1' }}>{serviceRequest.inspection.advisorRemarks}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                        Itemized Quotation Breakdown
                      </span>
                      {serviceRequest.estimate ? (
                        <span className={`badge ${serviceRequest.estimate.customerDecision === 'approved' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                          {serviceRequest.estimate.customerDecision?.toUpperCase() || 'DRAFT'}
                        </span>
                      ) : (
                        <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>No Quote</span>
                      )}
                    </div>

                    {!serviceRequest.estimate ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No quote generated yet. Advisor can draft during call.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.35)',
                          padding: '0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Quote:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                            ${serviceRequest.estimate.totalAmount?.toFixed(2)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {serviceRequest.estimate.items?.map((it, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem 0.65rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                              }}
                            >
                              <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                                <div style={{ color: '#fff' }}>{it.description}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                  Qty: {it.quantity} • {it.type.toUpperCase()}
                                </div>
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e2e8f0' }}>
                                ${(it.total || it.quantity * it.unitPrice).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {serviceRequest.estimate.customerSignature && (
                          <div style={{
                            padding: '0.6rem 0.75rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.725rem',
                            color: '#34d399',
                          }}>
                            ✓ Digitally Authorized by: {serviceRequest.estimate.customerSignature}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoConsultationModal;
