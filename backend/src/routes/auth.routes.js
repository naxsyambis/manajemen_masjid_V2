const router = require("express").Router();
const controller = require("../controllers/auth/auth.controller");

router.post("/login", controller.login);

module.exports = router;
