const router = require("express").Router();
const controller = require("../controllers/auth/auth.controller");
const auth = require("../middleware/auth.middleware"); 
const upload = require("../middleware/upload.middleware");

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get("/profile", auth, controller.getProfile); 
router.put("/profile/ttd", auth, upload.single("ttd"), controller.uploadTtd);
router.delete("/profile/ttd",auth, controller.deleteTtd);

module.exports = router;