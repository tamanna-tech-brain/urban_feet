const store = require('../utils/dataStore');

// @desc Get vehicles (filtered for customer or all for staff)
// @route GET /api/vehicles
exports.getVehicles = async (req, res) => {
  try {
    let vehicles = store.vehicles;
    if (req.user && req.user.role === 'customer') {
      vehicles = vehicles.filter(v => String(v.customer) === String(req.user._id));
    }
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single vehicle
// @route GET /api/vehicles/:id
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = store.vehicles.find(v => String(v._id) === String(req.params.id));
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Add vehicle
// @route POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const { make, model, year, licensePlate, vin, mileage, fuelType, color } = req.body;
    if (!make || !model || !year || !licensePlate) {
      return res.status(400).json({ success: false, message: 'Please provide make, model, year, and license plate' });
    }

    const newVehicle = {
      _id: 'veh_' + Date.now(),
      customer: req.user._id,
      make,
      model,
      year: Number(year),
      licensePlate: licensePlate.toUpperCase().trim(),
      vin: (vin || '').toUpperCase().trim(),
      mileage: Number(mileage) || 0,
      fuelType: fuelType || 'Petrol',
      color: color || 'Metallic Grey',
      lastServiceDate: null,
      createdAt: new Date(),
    };

    store.vehicles.unshift(newVehicle);
    store.saveToFile();

    res.status(201).json({ success: true, data: newVehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update vehicle
// @route PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const idx = store.vehicles.findIndex(v => String(v._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    store.vehicles[idx] = {
      ...store.vehicles[idx],
      ...req.body,
      updatedAt: new Date(),
    };
    store.saveToFile();

    res.json({ success: true, data: store.vehicles[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
