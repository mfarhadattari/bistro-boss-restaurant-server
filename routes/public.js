const express = require("express");
const router = express.Router();

// ! ------------------ MENU DATA ------------------------! //
router.get("/menu", async (req, res) => {
  const menuCollection = req.menuCollection;
  const menu = await menuCollection.find().toArray();
  res.send(menu);
});

// ! ------------------ REVIEW DATA ------------------------! //
router.get("/reviews", async (req, res) => {
  const reviewCollection = req.reviewCollection;
  const reviews = await reviewCollection.find().toArray();
  res.send(reviews);
});

module.exports = router;
