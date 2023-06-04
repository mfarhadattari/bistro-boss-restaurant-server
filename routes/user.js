const express = require("express");
const { jwtVerify } = require("../utilities/middleware");
const { ObjectId } = require("mongodb");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);


// ! ---------------- CREATE USER -------------------  ! //
router.post("/users", async (req, res) => {
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

// ! ---------------- ADD TO CART -------------------  ! //
router.post("/carts", async (req, res) => {
  const cartItem = req.body;
  const cartCollection = req.cartCollection;
  const query = { foodID: cartItem.foodID, email: cartItem.email };
  const find = await cartCollection.findOne(query);
  if (find) {
    const previousQuantity = find.quantity;
    const updateDoc = {
      $set: {
        quantity: previousQuantity + 1,
      },
    };
    const result = await cartCollection.updateOne(find, updateDoc);
    res.send(result);
  } else {
    cartItem.quantity = 1;
    const result = await cartCollection.insertOne(cartItem);
    res.send(result);
  }
});

// !---------------------- DELETE A ITEM FROM CART -------------------! //
router.delete("/carts/:id", async (req, res) => {
  const cartCollection = req.cartCollection;
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});

// !---------------------- GET CARTS OF AN USER ------------------- ! //
router.get("/carts", jwtVerify, async (req, res) => {
  const cartCollection = req.cartCollection;
  const email = req.query.email;
  if (!email) {
    res.send([]);
  }
  const decoded = req.decoded;
  if (!email === decoded.email) {
    res.status(403).send({ error: true, message: "Forbidden Access" });
  }
  const query = { email: email };
  const result = await cartCollection.find(query).toArray();
  res.send(result);
});

// ! Payment Intent
router.post("/create-payment-intent", jwtVerify, async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

// !Payment Confirmation
router.post("/payment-confirmation", jwtVerify, async (req, res) => {
  const paymentCollection = req.paymentCollection;
  const cartCollection = req.cartCollection;

  const paymentInfo = req.body;
  const paymentConfirmation = await paymentCollection.insertOne(paymentInfo);
  const filter = {
    _id: {
      $in: paymentInfo.cartInfo.map((item) => new ObjectId(item._id)),
    },
  };
  const deleteConfirmation = await cartCollection.deleteMany(filter);
  res.send({ paymentConfirmation, deleteConfirmation });
});

module.exports = router;
