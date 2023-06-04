const express = require("express");
const router = express.Router();

const { jwtVerify } = require("../utilities/middleware");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// !------------------- GENERATE TOKEN ---------------------------- ! //
router.post("/jwt", (req, res) => {
  const data = req.body;
  const token = jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
    expiresIn: "1h",
    algorithm: "HS512",
  });
  res.send({ token });
});

// ! ---------------------- CHECK ADMIN --------------------- ! //
router.get("/user/admin", jwtVerify, async (req, res) => {
  const userCollection = req.userCollection;
  const email = req.query.email;
  if (email !== req.decoded.email) {
    return res.status(403).send({ error: true, message: "Access Forbidden" });
  }
  const query = { email: email };
  const result = await userCollection.findOne(query);
  if (result?.role !== "admin") {
    return res.send({ isAdmin: false });
  }
  res.send({ isAdmin: true });
});

module.exports = router;
