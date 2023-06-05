const express = require("express");
const { jwtVerify, adminVerify } = require("../utilities/middleware");
const { ObjectId } = require("mongodb");
const router = express.Router();

// ! ------------------------- GET ALL USER ---------------- ! //
router.get("/all-users", jwtVerify, adminVerify, async (req, res) => {
  const userCollection = req.userCollection;
  const users = await userCollection.find().toArray();
  res.send(users);
});

// ! -------------------- MAKE USER ADMIN --------------------- ! //
router.patch("/make-admin/:id", jwtVerify, adminVerify, async (req, res) => {
  const userCollection = req.userCollection;
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await userCollection.updateOne(query, updateDoc);
  res.send(result);
});

// ! ---------------------------- ADD AN ITEM ------------------------- ! //
router.post("/add-item", jwtVerify, adminVerify, async (req, res) => {
  const menuCollection = req.menuCollection;
  const data = req.body;
  const result = await menuCollection.insertOne(data);
  res.send(result);
});

// ! ------------------------------- REMOVE AN ITEM ---------------------- ! //
router.delete("/delete-item/:id", jwtVerify, adminVerify, async (req, res) => {
  const menuCollection = req.menuCollection;
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await menuCollection.deleteOne(query);
  res.send(result);
});

// ! -------------------------------- PAYMENT DATA ---------------------------- ! //
router.get("/payment-info", jwtVerify, adminVerify, async (req, res) => {
  const paymentCollection = req.paymentCollection;
  const result = await paymentCollection.find().toArray();
  res.send(result);
});

module.exports = router;
