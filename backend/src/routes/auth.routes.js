const router = require("express").Router();
const controller = require("../controllers/auth/auth.controller");
const auth = require("../middleware/auth.middleware"); // Import sebagai 'auth'

router.post("/login", controller.login);
router.post("/register", controller.register);

// Ganti 'authMiddleware' menjadi 'auth' agar sesuai dengan import di atas
router.get("/profile", auth, controller.getProfile); 

module.exports = router;