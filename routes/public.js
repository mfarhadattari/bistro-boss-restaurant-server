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

// ! ---------------- CREATE USER -------------------  ! //
router.post("/create-users", async (req, res) => {
  const userCollection = req.userCollection;
  const userInfo = req.body;
  if (userInfo.email && userInfo.displayName) {
    const query = { email: userInfo.email };
    const alreadyExist = await userCollection.findOne(query);
    if (!alreadyExist) {
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    } else {
      const isSameName = alreadyExist.displayName === userInfo.displayName;
      if (isSameName) {
        const result = { alreadyExist: true };
        res.send(result);
      } else {
        const updateDoc = {
          $set: {
            displayName: userInfo.displayName,
          },
        };
        const result = await userCollection.updateOne(alreadyExist, updateDoc);
        res.send(result);
      }
    }
  }
});

module.exports = router;
