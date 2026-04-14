import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { politician_id } = req.query;
    const user = req.user;
    let targetPoliticianId = politician_id ? parseInt(politician_id) : user.politician_id;
    
    if (user.role === "super_admin" && !targetPoliticianId) {
      const [modules] = await pool.query("SELECT * FROM module_registry WHERE is_active = TRUE ORDER BY sort_order");
      return res.json({ success: true, modules, hasOverrides: false });
    }
    
    if (!targetPoliticianId) {
      return res.status(400).json({ success: false, error: "No politician associated" });
    }
    
    const [politicians] = await pool.query("SELECT primary_role, secondary_role FROM politician_profiles WHERE id = ?", [targetPoliticianId]);
    if (politicians.length === 0) {
      return res.status(404).json({ success: false, error: "Politician not found" });
    }
    
    const politician = politicians[0];
    const roles = [politician.primary_role];
    if (politician.secondary_role && politician.secondary_role !== "none") {
      roles.push(politician.secondary_role);
    }
    
    const placeholders = roles.map(() => "?").join(",");
    const [roleModules] = await pool.query("SELECT DISTINCT rm.module_key FROM role_module_mapping rm JOIN module_registry mr ON rm.module_key = mr.module_key WHERE rm.role_key IN (" + placeholders + ") AND mr.is_active = TRUE", roles);
    
    const [overrides] = await pool.query("SELECT module_key, is_enabled FROM politician_module_overrides WHERE politician_id = ?", [targetPoliticianId]);
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.module_key] = o.is_enabled; });
    
    let moduleKeys = roleModules.map(m => m.module_key);
    moduleKeys = moduleKeys.filter(key => {
      if (overrideMap.hasOwnProperty(key)) { return overrideMap[key] === true; }
      return true;
    });
    
    const [modules] = await pool.query("SELECT * FROM module_registry WHERE module_key IN (" + moduleKeys.map(() => "?").join(",") + ") AND is_active = TRUE ORDER BY sort_order", moduleKeys);
    const modulesWithOverride = modules.map(m => ({ ...m, isOverridden: overrideMap.hasOwnProperty(m.module_key), overrideEnabled: overrideMap[m.module_key] ?? null }));
    
    res.json({ success: true, modules: modulesWithOverride, hasOverrides: Object.keys(overrideMap).length > 0, politician: { id: targetPoliticianId, primary_role: politician.primary_role, secondary_role: politician.secondary_role } });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ success: false, error: "Failed to fetch modules" });
  }
});

router.post("/override", authMiddleware, async (req, res) => {
  try {
    const { politician_id, module_key, is_enabled, reason } = req.body;
    const user = req.user;
    if (user.role !== "super_admin" && user.role !== "politician_admin") {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }
    if (!politician_id || !module_key) {
      return res.status(400).json({ success: false, error: "politician_id and module_key required" });
    }
    await pool.query("INSERT INTO politician_module_overrides (politician_id, module_key, is_enabled, overridden_by, reason) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled), overridden_by = VALUES(overridden_by), reason = VALUES(reason), overridden_at = CURRENT_TIMESTAMP", [politician_id, module_key, is_enabled ? 1 : 0, user.id, reason || null]);
    res.json({ success: true, message: "Module " + module_key + " " + (is_enabled ? "enabled" : "disabled") });
  } catch (error) {
    console.error("Error setting override:", error);
    res.status(500).json({ success: false, error: "Failed to set override" });
  }
});

router.get("/overrides/:politician_id", authMiddleware, async (req, res) => {
  try {
    const [overrides] = await pool.query("SELECT o.module_key, o.is_enabled, o.reason, o.overridden_at, m.module_name FROM politician_module_overrides o JOIN module_registry m ON o.module_key = m.module_key WHERE o.politician_id = ? ORDER BY o.overridden_at DESC", [req.params.politician_id]);
    res.json({ success: true, overrides });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch overrides" });
  }
});

export default router;
