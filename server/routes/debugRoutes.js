const express = require("express");
const debugController = require("../controllers/debugController");

const router = express.Router();

// Debug routes
router.get("/", debugController.getDebugInfo);
router.post("/create-fresh-admin", debugController.createFreshAdmin);
router.get("/check-user/:email", debugController.checkUser);
router.post("/test-bcrypt", debugController.testBcrypt);

module.exports = router;
