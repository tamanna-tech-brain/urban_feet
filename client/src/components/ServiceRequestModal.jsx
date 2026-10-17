import React, { useState, useEffect } from 'react';
import { X, Car, Calendar, MapPin, Wrench, AlertCircle, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ServiceRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, showToast } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [serviceCenterId, setServiceCenterId] = useState('');
  const [serviceType, setServiceType] = useState('Scheduled Periodic Maintenance');
  const [primaryConcerns, setPrimaryConcerns] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [odometer, setOdometer] = useState('');

  // New Vehicle form states
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2024');
  const [newPlate, setNewPlate] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      // Set default tomorrow date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const loadDependencies = async () => {
    try {
      const [vRes, cRes] = await Promise.all([
        api.getVehicles(),
        api.getServiceCenters(),
      ]);
      if (vRes.success) {
        setVehicles(vRes.data);
        if (vRes.data.length > 0) {
          setVehicleId(vRes.data[0]._id);
          setOdometer(vRes.data[0].mileage || '');
        }
      }
      if (cRes.success) {
        setCenters(cRes.data);
        if (cRes.data.length > 0) {
          setServiceCenterId(cRes.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!newMake || !newModel || !newPlate) {
      showToast('Please fill make, model, and license plate', 'error');
      return;
    }
    try {
      const res = await api.createVehicle({
        make: newMake,
        model: newModel,
        year: newYear,
        licensePlate: newPlate,
        mileage: Number(odometer) || 10000,
      });
      if (res.success) {
        setVehicles([res.data, ...vehicles]);
        setVehicleId(res.data._id);
        setShowAddVehicle(false);
        showToast(`Vehicle ${res.data.make} ${res.data.model} added!`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId || !serviceCenterId || !primaryConcerns.trim()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createServiceRequest({
        vehicleId,
        serviceCenterId,
        serviceType,
        primaryConcerns,
        preferredDate,
        odometerAtIntake: Number(odometer) || 0,
      });

      if (res.success) {
        showToast(`Service Request ${res.data.caseId} successfully created!`);
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              <Wrench size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Raise Vehicle Service Request</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stage 1: Case Intake & Appointment Scheduling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Vehicle Selection or Quick Add */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label">Select Registered Fleet Vehicle *</label>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} />
                  {showAddVehicle ? 'Select existing' : 'Add new vehicle'}
                </button>
              </div>

              {!showAddVehicle ? (
                <select
                  className="form-select"
                  value={vehicleId}
                  onChange={e => {
                    setVehicleId(e.target.value);
                    const v = vehicles.find(item => item._id === e.target.value);
                    if (v) setOdometer(v.mileage);
                  }}
                  required
                >
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.year} {v.make} {v.model} ({v.licensePlate}) - {v.mileage?.toLocaleString()} mi
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                }}>
                  <input
                    type="text"
                    placeholder="Make (e.g. Tesla, Ford)"
                    className="form-input"
                    value={newMake}
                    onChange={e => setNewMake(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Model (e.g. Model Y)"
                    className="form-input"
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    className="form-input"
                    value={newYear}
                    onChange={e => setNewYear(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="License Plate"
                    className="form-input"
                    value={newPlate}
                    onChange={e => setNewPlate(e.target.value)}
                  />
                  <div style={{ gridColumn: 'span 2' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCreateVehicle}
                      style={{ width: '100%' }}
                    >
                      Save & Select Vehicle
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Service Center & Appointment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service Center Hub *</label>
                <select
                  className="form-select"
                  value={serviceCenterId}
                  onChange={e => setServiceCenterId(e.target.value)}
                  required
                >
                  {centers.map(sc => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name} ({sc.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Service Package & Mileage */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service Package / Category *</label>
                <select
                  className="form-select"
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                >
                  <option value="Scheduled Periodic Maintenance">Scheduled Periodic Maintenance</option>
                  <option value="Brake System Overhaul">Brake System Overhaul</option>
                  <option value="Engine Diagnostics & Tune-up">Engine Diagnostics & Tune-up</option>
                  <option value="AC & Climate Control">AC & Climate Control</option>
                  <option value="Suspension & Steering Service">Suspension & Steering Service</option>
                  <option value="Full Fleet Safety Inspection">Full Fleet Safety Inspection</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Odometer (mi)</label>
                <input
                  type="number"
                  className="form-input"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  placeholder="e.g. 28450"
                />
              </div>
            </div>

            {/* Symptoms & Primary Concerns */}
            <div className="form-group">
              <label className="form-label">Vehicle Symptoms & Special Instructions *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe any strange noises, vibrations, dashboard warning lights, or specific service items..."
                value={primaryConcerns}
                onChange={e => setPrimaryConcerns(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Case...' : 'Confirm & Submit Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequestModal;
