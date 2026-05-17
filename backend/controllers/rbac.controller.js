const RbacConfig = require('../models/RbacConfig');

/**
 * GET /api/rbac/config
 * Returns the current RBAC permission matrix.
 * Any authenticated user can read (they need it to build their sidebar).
 */
exports.getConfig = async (req, res) => {
  try {
    let config = await RbacConfig.findOne({ order: [['id', 'DESC']] });
    if (!config) {
      // No config saved yet — return empty so the frontend falls back to defaults
      return res.json({ permissions: null, customRoles: [] });
    }
    res.json({
      permissions: config.config_json,
      customRoles: config.custom_roles_json,
    });
  } catch (error) {
    console.error('RBAC getConfig error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/rbac/config
 * Saves the full RBAC permission matrix.
 * Only super_admin / branch_admin should call this (enforced by middleware).
 */
exports.saveConfig = async (req, res) => {
  try {
    const { permissions, customRoles } = req.body;
    if (!permissions) {
      return res.status(400).json({ error: 'permissions object is required' });
    }

    // Upsert — always overwrite the single config row
    let config = await RbacConfig.findOne({ order: [['id', 'DESC']] });
    if (config) {
      config.config_json = permissions;
      config.custom_roles_json = customRoles || [];
      config.updated_by = req.user?.id || null;
      await config.save();
    } else {
      config = await RbacConfig.create({
        config_json: permissions,
        custom_roles_json: customRoles || [],
        updated_by: req.user?.id || null,
      });
    }

    res.json({ message: 'RBAC configuration saved successfully.', id: config.id });
  } catch (error) {
    console.error('RBAC saveConfig error:', error);
    res.status(500).json({ error: error.message });
  }
};
