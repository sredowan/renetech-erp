const Student = require('../models/Student');

const deviceMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'student') {
      const deviceId = req.headers['x-device-id'];
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required for students' });
      }

      const student = await Student.findOne({ where: { user_id: req.user.id } });
      
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      req.student = student; // attach to req for later premium checks

      if (student.plan_type === 'premium') {
        let devices = student.active_devices || [];
        
        if (!devices.includes(deviceId)) {
          if (devices.length >= 2) {
            // Remove the oldest device (logout oldest session approach)
            devices.shift();
          }
          devices.push(deviceId);
          
          await student.update({ active_devices: devices });
        } else {
          // If the device is already in the array, maybe it's not the most recently used?
          // We can optionally move it to the end of the array to mark it as most recently active.
          devices = devices.filter(id => id !== deviceId);
          devices.push(deviceId);
          await student.update({ active_devices: devices });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Device Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during device validation' });
  }
};

module.exports = { deviceMiddleware };
