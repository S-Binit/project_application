const express = require("express");
const router = express.Router();
const { register, userLogin, driverLogin } = require("../controllers/auth.controller");

router.get("/health", (_req, res) => res.json({ ok: true }));
router.post("/register", register);
router.post("/login", userLogin);
router.post("/driver/login", driverLogin);

module.exports = router;
