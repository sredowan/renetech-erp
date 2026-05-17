const premiumMiddleware = async (req, res, next) => {
  try {
    const student = req.student; // Assuming deviceMiddleware runs first and attaches this

    if (!student) {
      return res.status(403).json({ error: 'Premium access requires a student profile' });
    }

    if (student.plan_type !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium Access Required', 
        message: 'This feature is locked. Upgrade to Premium to access.' 
      });
    }

    // Check if premium is expired
    if (student.premium_expiry_date && new Date(student.premium_expiry_date) < new Date()) {
      // Revert to free plan automatically
      await student.update({ plan_type: 'free', active_devices: [] });
      return res.status(403).json({ 
        error: 'Premium Expired', 
        message: 'Your Premium plan has expired. Please renew to access this feature.' 
      });
    }

    next();
  } catch (error) {
    console.error('Premium Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during premium validation' });
  }
};

module.exports = { premiumMiddleware };
