const router = require("express").Router();
const controller = require("../controllers/auth/auth.controller");
const auth = require("../middleware/auth.middleware"); 

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get("/profile", auth, controller.getProfile); 
router.put("/profile/ttd", auth, controller.updateTtd);

module.exports = router;