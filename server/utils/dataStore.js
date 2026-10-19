/**
 * Urban Fleet Operations - Unified In-Memory & File-backed Data Store
 * Provides zero-configuration instant persistence and seed data,
 * allowing the MERN application to operate seamlessly whether local MongoDB
 * is connected or running in standalone mode.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'store.json');

const initialUsers = [
  {
    _id: 'usr_cust_01',
    name: 'Johnathan Vance',
    email: 'customer@urbanfleet.com',
    password: 'password123',
    role: 'customer',
    phone: '+1 (555) 234-8901',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialization: '',
    createdAt: new Date('2026-01-15T08:00:00Z'),
  },
  {
    _id: 'usr_adv_01',
    name: 'Sarah Jenkins',
    email: 'advisor@urbanfleet.com',
    password: 'password123',
    role: 'advisor',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialization: 'Certified Master Service Advisor',
    createdAt: new Date('2026-01-10T08:00:00Z'),
  },
  {
    _id: 'usr_tech_01',
    name: 'Marcus Miller',
    email: 'tech@urbanfleet.com',
    password: 'password123',
    role: 'technician',
    phone: '+1 (555) 678-1234',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialization: 'High-Voltage EV & Braking Systems Specialist',
    createdAt: new Date('2026-01-12T08:00:00Z'),
  },
  {
    _id: 'usr_admin_01',
    name: 'Elena Rostova',
    email: 'admin@urbanfleet.com',
    password: 'password123',
    role: 'admin',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialization: 'Director of Fleet Operations & Quality',
    createdAt: new Date('2026-01-01T08:00:00Z'),
  },
];

const initialVehicles = [
  {
    _id: 'veh_01',
    customer: 'usr_cust_01',
    make: 'Tesla',
    model: 'Model 3 Performance',
    year: 2023,
    licensePlate: '7XFL920',
    vin: '5YJ3E1EB7NF289104',
    mileage: 28450,
    fuelType: 'Electric',
    color: 'Midnight Silver Metallic',
    lastServiceDate: new Date('2025-11-20T10:00:00Z'),
    createdAt: new Date('2026-01-15T09:00:00Z'),
  },
  {
    _id: 'veh_02',
    customer: 'usr_cust_01',
    make: 'Ford',
    model: 'F-150 Lightning EV',
    year: 2024,
    licensePlate: '9KLT441',
    vin: '1FT6W1EV3PW102834',
    mileage: 14200,
    fuelType: 'Electric',
    color: 'Oxford White',
    lastServiceDate: new Date('2026-01-05T14:30:00Z'),
    createdAt: new Date('2026-01-16T11:00:00Z'),
  },
  {
    _id: 'veh_03',
    customer: 'usr_cust_01',
    make: 'Porsche',
    model: 'Taycan 4S',
    year: 2024,
    licensePlate: 'TYC4088',
    vin: 'WP0AA2Y15PSA98321',
    mileage: 8900,
    fuelType: 'Electric',
    color: 'Gentian Blue',
    lastServiceDate: null,
    createdAt: new Date('2026-02-01T08:00:00Z'),
  },
];

const initialServiceCenters = [
  {
    _id: 'sc_01',
    name: 'Urban Fleet Hub - Downtown Central',
    code: 'UFO-DT-01',
    address: '450 Innovation Parkway, Suite 100',
    city: 'San Francisco, CA',
    phone: '+1 (415) 555-0199',
    operatingHours: 'Mon - Sat: 07:30 AM - 07:30 PM',
    bayCapacity: 12,
  },
  {
    _id: 'sc_02',
    name: 'Urban Fleet SuperCenter - Silicon Valley North',
    code: 'UFO-SV-02',
    address: '1280 Tech Boulevard',
    city: 'San Jose, CA',
    phone: '+1 (408) 555-0188',
    operatingHours: 'Mon - Sun: 07:00 AM - 08:00 PM',
    bayCapacity: 18,
  },
  {
    _id: 'sc_03',
    name: 'Urban Fleet Rapid Service - East Bay Express',
    code: 'UFO-EB-03',
    address: '890 Marina Vista Ave',
    city: 'Oakland, CA',
    phone: '+1 (510) 555-0177',
    operatingHours: 'Mon - Fri: 08:00 AM - 06:00 PM',
    bayCapacity: 8,
  },
];

const initialInspections = [
  {
    _id: 'insp_01',
    serviceRequest: 'req_02',
    inspector: 'usr_adv_01',
    odometerReading: 28450,
    fuelLevel: '3/4',
    checklist: [
      { category: 'Braking System', item: 'Front Brake Pads Thickness', status: 'warning', notes: 'Front pads worn to 3mm. Replacement advised.' },
      { category: 'Braking System', item: 'Rear Brake Pads & Rotors', status: 'pass', notes: 'Good condition at 6mm.' },
      { category: 'Tires & Wheels', item: 'Tire Tread Depth & Pressure', status: 'pass', notes: '42 PSI all round, 6/32" tread.' },
      { category: 'Battery & Electrical', item: 'High-Voltage Battery State of Health', status: 'pass', notes: '98% battery pack efficiency.' },
      { category: 'Fluids & Thermal', item: 'Coolant Level & Thermal Loop', status: 'pass', notes: 'Optimal coolant concentration.' },
      { category: 'Cabin & Airflow', item: 'HEPA Cabin Microfilter', status: 'fail', notes: 'Clogged with wildfire soot. High restriction.' },
      { category: 'Suspension', item: 'Control Arms & Bushings', status: 'pass', notes: 'Tension links inspected, no tear.' },
      { category: 'Safety & Exterior', item: 'Lighting & Autopilot Sensors', status: 'pass', notes: 'Cameras cleaned and calibrated.' },
    ],
    advisorRemarks: 'Vehicle generally in pristine condition. Front brake wear requires attention along with fresh cabin HEPA filter.',
    recommendImmediateRepair: true,
    completedAt: new Date('2026-10-16T10:15:00Z'),
  },
  {
    _id: 'insp_02',
    serviceRequest: 'req_03',
    inspector: 'usr_adv_01',
    odometerReading: 14200,
    fuelLevel: 'Full',
    checklist: [
      { category: 'Braking System', item: 'Brake Fluid Moisture Level', status: 'pass', notes: 'Moisture < 1%' },
      { category: 'Tires & Wheels', item: 'Tire Tread & Rotation', status: 'warning', notes: 'Uneven wear on front right tire.' },
      { category: 'Battery & Electrical', item: '12V Auxiliary Battery', status: 'warning', notes: 'Charge holding low, recommends trickle cycle.' },
      { category: 'Suspension', item: 'Front Strut Mounts', status: 'pass', notes: 'Torque verified.' },
    ],
    advisorRemarks: 'Tire rotation & front wheel realignment required to prevent premature tire replacement.',
    recommendImmediateRepair: false,
    completedAt: new Date('2026-10-17T09:00:00Z'),
  },
];

const initialEstimates = [
  {
    _id: 'est_01',
    serviceRequest: 'req_02',
    preparedBy: 'usr_adv_01',
    items: [
      { type: 'part', description: 'OEM Performance Ceramic Front Brake Pads', quantity: 1, unitPrice: 220, total: 220 },
      { type: 'part', description: 'Activated Carbon HEPA Dual Cabin Filter Pack', quantity: 1, unitPrice: 85, total: 85 },
      { type: 'labor', description: 'Brake Pad Replacement & Caliper Service Labor', quantity: 1.5, unitPrice: 120, total: 180 },
      { type: 'labor', description: 'HVAC Filter Extraction & Sanitization Labor', quantity: 0.5, unitPrice: 120, total: 60 },
      { type: 'diagnostic', description: 'High-Voltage Electrical & Sensor Diagnostic Sweep', quantity: 1, unitPrice: 75, total: 75 },
    ],
    subtotal: 620,
    taxRate: 8.5,
    taxAmount: 52.7,
    discount: 30, // Promo discount
    totalAmount: 642.7,
    estimatedHours: 2.0,
    advisorNotes: 'Specialized high-durability ceramic pads selected. Customer discount voucher UFO-SPRING applied.',
    customerDecision: 'approved',
    customerNotes: 'Approved via customer portal. Please proceed with service.',
    customerSignature: 'J. Vance',
    decisionTimestamp: new Date('2026-10-16T11:45:00Z'),
    createdAt: new Date('2026-10-16T10:45:00Z'),
  },
  {
    _id: 'est_02',
    serviceRequest: 'req_03',
    preparedBy: 'usr_adv_01',
    items: [
      { type: 'labor', description: 'Four-Wheel High-Precision Computerized Laser Alignment', quantity: 1, unitPrice: 160, total: 160 },
      { type: 'labor', description: 'Cross-Tire Rotation & Dynamic Balancing', quantity: 1, unitPrice: 70, total: 70 },
      { type: 'part', description: '12V AGM Auxiliary Battery Replacement Unit', quantity: 1, unitPrice: 195, total: 195 },
      { type: 'diagnostic', description: 'Suspension & Chassis Torque Check', quantity: 0.5, unitPrice: 120, total: 60 },
    ],
    subtotal: 485,
    taxRate: 8.5,
    taxAmount: 41.22,
    discount: 0,
    totalAmount: 526.22,
    estimatedHours: 2.5,
    advisorNotes: 'Recommended service based on 25-point intake inspection to resolve steering pull.',
    customerDecision: 'pending',
    customerNotes: '',
    customerSignature: '',
    decisionTimestamp: null,
    createdAt: new Date('2026-10-17T09:30:00Z'),
  },
];

const initialServiceRequests = [
  {
    _id: 'req_01',
    caseId: 'SR-2026-001',
    customer: 'usr_cust_01',
    vehicle: 'veh_01',
    serviceCenter: 'sc_01',
    serviceType: 'Scheduled Periodic Maintenance',
    primaryConcerns: '25,000-mile comprehensive factory periodic inspection, fluid checks, and tire rotation.',
    preferredDate: new Date('2026-10-10T09:00:00Z'),
    currentStage: 'Resolved',
    status: 'COMPLETED',
    assignedAdvisor: 'usr_adv_01',
    assignedTechnician: 'usr_tech_01',
    slaHours: 24,
    slaDeadline: new Date('2026-10-11T09:00:00Z'),
    odometerAtIntake: 26000,
    inspection: null,
    estimate: null,
    timeline: [
      { stage: 'Request Intake', status: 'NEW', action: 'Customer logged service request online', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-09T14:00:00Z') },
      { stage: 'Inspection & Estimate', status: 'ESTIMATED', action: 'Digital inspection & quote completed', performedBy: 'Sarah Jenkins (Advisor)', timestamp: new Date('2026-10-10T10:00:00Z') },
      { stage: 'Customer Approval', status: 'APPROVED', action: 'Customer approved $340 estimate online', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-10T11:00:00Z') },
      { stage: 'Service Execution', status: 'IN_PROGRESS', action: 'Technician commenced scheduled maintenance', performedBy: 'Marcus Miller (Technician)', timestamp: new Date('2026-10-10T13:00:00Z') },
      { stage: 'Quality Check & Pickup', status: 'READY_FOR_PICKUP', action: 'QA passed, customer notified', performedBy: 'Sarah Jenkins (Advisor)', timestamp: new Date('2026-10-10T16:30:00Z') },
      { stage: 'Resolved', status: 'COMPLETED', action: 'Vehicle picked up and invoice settled', performedBy: 'System', timestamp: new Date('2026-10-10T17:30:00Z') },
    ],
    createdAt: new Date('2026-10-09T14:00:00Z'),
    updatedAt: new Date('2026-10-10T17:30:00Z'),
  },
  {
    _id: 'req_02',
    caseId: 'SR-2026-002',
    customer: 'usr_cust_01',
    vehicle: 'veh_01',
    serviceCenter: 'sc_01',
    serviceType: 'Brake System Overhaul',
    primaryConcerns: 'Slight squeaking sound during high-speed deceleration and unusual cabin odor when AC is running.',
    preferredDate: new Date('2026-10-16T08:30:00Z'),
    currentStage: 'Service Execution',
    status: 'IN_PROGRESS',
    assignedAdvisor: 'usr_adv_01',
    assignedTechnician: 'usr_tech_01',
    slaHours: 24,
    slaDeadline: new Date('2026-10-17T18:00:00Z'),
    odometerAtIntake: 28450,
    inspection: 'insp_01',
    estimate: 'est_01',
    videoConsultation: {
      active: false,
      status: 'completed',
      meetingUrl: 'https://meet.jit.si/UrbanFleet-SR2026002-arch#config.prejoinPageEnabled=false&config.disableDeepLinking=true',
      roomName: 'UrbanFleet-SR2026002-arch',
      pin: '394821',
      agenda: 'Brake Pad Wear & HEPA Filter Replacement Review',
      host: 'usr_adv_01',
      hostName: 'Sarah Jenkins (Advisor)',
      createdAt: new Date('2026-10-16T11:00:00Z'),
      startedAt: new Date('2026-10-16T11:00:00Z'),
      endedAt: new Date('2026-10-16T11:22:00Z'),
    },
    timeline: [
      { stage: 'Request Intake', status: 'NEW', action: 'Request created via customer portal', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-15T16:00:00Z') },
      { stage: 'Inspection & Estimate', status: 'INSPECTION_PENDING', action: 'Assigned to Service Advisor Sarah Jenkins', performedBy: 'System', timestamp: new Date('2026-10-16T08:45:00Z') },
      { stage: 'Inspection & Estimate', status: 'ESTIMATED', action: '25-point inspection complete & estimate created', performedBy: 'Sarah Jenkins (Advisor)', timestamp: new Date('2026-10-16T10:45:00Z') },
      { stage: 'Customer Approval', status: 'AWAITING_APPROVAL', action: 'Automated notification and estimate sent to customer', performedBy: 'System', timestamp: new Date('2026-10-16T10:46:00Z') },
      { stage: 'Customer Approval', status: 'APPROVED', action: 'Estimate approved ($642.70) with digital signature', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-16T11:45:00Z') },
      { stage: 'Service Execution', status: 'ASSIGNED', action: 'Work order routed to Master Tech Marcus Miller', performedBy: 'Sarah Jenkins', timestamp: new Date('2026-10-16T13:00:00Z') },
      { stage: 'Service Execution', status: 'IN_PROGRESS', action: 'Brake pads extraction and caliper cleaning initiated', performedBy: 'Marcus Miller (Technician)', timestamp: new Date('2026-10-17T09:15:00Z') },
    ],
    createdAt: new Date('2026-10-15T16:00:00Z'),
    updatedAt: new Date('2026-10-17T09:15:00Z'),
  },
  {
    _id: 'req_03',
    caseId: 'SR-2026-003',
    customer: 'usr_cust_01',
    vehicle: 'veh_02',
    serviceCenter: 'sc_02',
    serviceType: 'Suspension & Steering Service',
    primaryConcerns: 'Truck pulls slightly to right on highway; 12V warning icon flashed once on cold start.',
    preferredDate: new Date('2026-10-17T10:00:00Z'),
    currentStage: 'Customer Approval',
    status: 'AWAITING_APPROVAL',
    assignedAdvisor: 'usr_adv_01',
    assignedTechnician: null,
    slaHours: 24,
    slaDeadline: new Date('2026-10-18T10:00:00Z'),
    odometerAtIntake: 14200,
    inspection: 'insp_02',
    estimate: 'est_02',
    videoConsultation: {
      active: true,
      status: 'live',
      meetingUrl: 'https://meet.jit.si/UrbanFleet-SR2026003-live#config.prejoinPageEnabled=false&config.disableDeepLinking=true',
      roomName: 'UrbanFleet-SR2026003-live',
      pin: '748291',
      agenda: '25-Point Inspection Findings & Estimate Walkthrough',
      host: 'usr_adv_01',
      hostName: 'Sarah Jenkins (Advisor)',
      createdAt: new Date('2026-10-17T09:35:00Z'),
      startedAt: new Date('2026-10-17T09:35:00Z'),
      endedAt: null,
    },
    timeline: [
      { stage: 'Request Intake', status: 'NEW', action: 'Service Request lodged online', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-17T08:00:00Z') },
      { stage: 'Inspection & Estimate', status: 'ESTIMATED', action: 'Advisor inspection conducted. Detailed quote $526.22 prepared.', performedBy: 'Sarah Jenkins (Advisor)', timestamp: new Date('2026-10-17T09:30:00Z') },
      { stage: 'Customer Approval', status: 'AWAITING_APPROVAL', action: 'Estimate dispatched to customer for digital consent', performedBy: 'System', timestamp: new Date('2026-10-17T09:31:00Z') },
      { stage: 'Customer Approval', status: 'AWAITING_APPROVAL', action: 'Live Video Consultation initiated by Sarah Jenkins (Advisor)', notes: 'Room: UrbanFleet-SR2026003-live | Agenda: 25-Point Inspection Findings & Estimate Walkthrough', performedBy: 'Sarah Jenkins (Advisor)', timestamp: new Date('2026-10-17T09:35:00Z') },
    ],
    createdAt: new Date('2026-10-17T08:00:00Z'),
    updatedAt: new Date('2026-10-17T09:35:00Z'),
  },
  {
    _id: 'req_04',
    caseId: 'SR-2026-004',
    customer: 'usr_cust_01',
    vehicle: 'veh_03',
    serviceCenter: 'sc_01',
    serviceType: 'Full Fleet Safety Inspection',
    primaryConcerns: 'First 10,000 km baseline safety and telemetry health checkup before long road trip.',
    preferredDate: new Date('2026-10-18T11:00:00Z'),
    currentStage: 'Request Intake',
    status: 'NEW',
    assignedAdvisor: null,
    assignedTechnician: null,
    slaHours: 24,
    slaDeadline: new Date('2026-10-19T11:00:00Z'),
    odometerAtIntake: 8900,
    inspection: null,
    estimate: null,
    timeline: [
      { stage: 'Request Intake', status: 'NEW', action: 'Request submitted by customer via Urban Fleet Web App', performedBy: 'Johnathan Vance', timestamp: new Date('2026-10-17T11:30:00Z') },
    ],
    createdAt: new Date('2026-10-17T11:30:00Z'),
    updatedAt: new Date('2026-10-17T11:30:00Z'),
  },
];

const initialNotifications = [
  {
    _id: 'notif_01',
    recipient: 'usr_cust_01',
    serviceRequest: 'req_03',
    caseId: 'SR-2026-003',
    title: 'Estimate Ready for Approval',
    message: 'Sarah Jenkins has prepared an itemized estimate ($526.22) for your Ford F-150 Lightning. Please review and approve.',
    type: 'estimate_ready',
    isRead: false,
    createdAt: new Date('2026-10-17T09:31:00Z'),
  },
  {
    _id: 'notif_02',
    recipient: 'usr_cust_01',
    serviceRequest: 'req_02',
    caseId: 'SR-2026-002',
    title: 'Service In Progress',
    message: 'Master Technician Marcus Miller has begun brake service on your Tesla Model 3.',
    type: 'service_in_progress',
    isRead: true,
    createdAt: new Date('2026-10-17T09:15:00Z'),
  },
  {
    _id: 'notif_03',
    recipient: 'usr_tech_01',
    serviceRequest: 'req_02',
    caseId: 'SR-2026-002',
    title: 'New Work Order Assigned',
    message: 'Case SR-2026-002 (Brake System Overhaul) has been assigned to your bay.',
    type: 'technician_assigned',
    isRead: false,
    createdAt: new Date('2026-10-16T13:00:00Z'),
  },
  {
    _id: 'notif_04',
    recipient: 'usr_adv_01',
    serviceRequest: 'req_04',
    caseId: 'SR-2026-004',
    title: 'New Service Request Logged',
    message: 'Porsche Taycan 4S logged for Full Fleet Safety Inspection at Downtown Central.',
    type: 'request_created',
    isRead: false,
    createdAt: new Date('2026-10-17T11:30:00Z'),
  },
  {
    _id: 'notif_05',
    recipient: 'usr_cust_01',
    serviceRequest: 'req_03',
    caseId: 'SR-2026-003',
    title: '📹 Live Video Consultation Ready',
    message: 'Sarah Jenkins has opened a live video walkaround for Case SR-2026-003. Join now to discuss suspension and battery findings.',
    type: 'video_consultation',
    isRead: false,
    meetingUrl: 'https://meet.jit.si/UrbanFleet-SR2026003-live#config.prejoinPageEnabled=false&config.disableDeepLinking=true',
    createdAt: new Date('2026-10-17T09:35:00Z'),
  },
];

class DataStore {
  constructor() {
    this.users = [...initialUsers];
    this.vehicles = [...initialVehicles];
    this.serviceCenters = [...initialServiceCenters];
    this.serviceRequests = [...initialServiceRequests];
    this.inspections = [...initialInspections];
    this.estimates = [...initialEstimates];
    this.notifications = [...initialNotifications];
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.users && data.users.length) this.users = data.users;
        if (data.vehicles && data.vehicles.length) this.vehicles = data.vehicles;
        if (data.serviceCenters && data.serviceCenters.length) this.serviceCenters = data.serviceCenters;
        if (data.serviceRequests && data.serviceRequests.length) this.serviceRequests = data.serviceRequests;
        if (data.inspections && data.inspections.length) this.inspections = data.inspections;
        if (data.estimates && data.estimates.length) this.estimates = data.estimates;
        if (data.notifications && data.notifications.length) this.notifications = data.notifications;
      }
    } catch (e) {
      console.warn('DataStore load warning:', e.message);
    }
  }

  saveToFile() {
    try {
      const data = {
        users: this.users,
        vehicles: this.vehicles,
        serviceCenters: this.serviceCenters,
        serviceRequests: this.serviceRequests,
        inspections: this.inspections,
        estimates: this.estimates,
        notifications: this.notifications,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('DataStore save warning:', e.message);
    }
  }

  // Helper to populate relations
  populateRequest(req) {
    if (!req) return null;
    const populated = { ...req };
    populated.customer = this.users.find(u => String(u._id) === String(req.customer)) || req.customer;
    populated.vehicle = this.vehicles.find(v => String(v._id) === String(req.vehicle)) || req.vehicle;
    populated.serviceCenter = this.serviceCenters.find(sc => String(sc._id) === String(req.serviceCenter)) || req.serviceCenter;
    populated.assignedAdvisor = this.users.find(u => String(u._id) === String(req.assignedAdvisor)) || req.assignedAdvisor;
    populated.assignedTechnician = this.users.find(u => String(u._id) === String(req.assignedTechnician)) || req.assignedTechnician;
    populated.inspection = this.inspections.find(i => String(i._id) === String(req.inspection)) || req.inspection;
    populated.estimate = this.estimates.find(e => String(e._id) === String(req.estimate)) || req.estimate;
    return populated;
  }
}

const store = new DataStore();
module.exports = store;
