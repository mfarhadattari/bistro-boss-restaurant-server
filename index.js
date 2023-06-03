const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// !----------------- JWT TOKEN VERIFY ------------------!
const jwtVerify = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized Access" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized Access" });
  }

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, ...err });
    }
    req.decoded = decoded;
    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxhaoz0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    //! /*----------------------- DB COLLECTION -------------------- */
    const DB = client.db("bistro-boss-restaurant");
    const menuCollection = DB.collection("foodsMenu");
    const reviewCollection = DB.collection("reviews");
    const cartCollection = DB.collection("carts");
    const userCollection = DB.collection("users");

    // !/* -------------------------- ADMIN VERIFY MIDDLEWARE ----------------------- */
    const adminVerify = async (req, res, next) => {
      const email = req.decoded.email;

      if (email !== req.query.email) {
        return res
          .status(403)
          .send({ error: true, message: "Access Forbidden" });
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      if (result.role !== "admin") {
        return res
          .status(403)
          .send({ error: true, message: "Access Forbidden" });
      }
      next();
    };

    /* --------------------------------------------------- Security APIs ------------------------------------------- */
    /* ---------------------------------------------------------------
      !------------------- GENERATE TOKEN ---------------------------- */
    app.post("/jwt", (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
        expiresIn: "1h",
        algorithm: "HS512",
      });
      res.send({ token });
    });

    // ! ---------------------- Check Admin ---------------------
    app.get("/user/admin", jwtVerify, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res
          .status(403)
          .send({ error: true, message: "Access Forbidden" });
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      if (result?.role !== "admin") {
        return res.send({ isAdmin: false });
      }
      res.send({ isAdmin: true });
    });

    /* ------------------------------------- PUBLIC ROUTE START ------------------------------------------------- */

    /* ----------------------------------------------------------
      !-------------------------- GET ALL MENUS ------------------- */
    app.get("/menu", async (req, res) => {
      const menu = await menuCollection.find().toArray();
      res.send(menu);
    });

    /* ----------------------------------------------------------
      !-------------------------- GET ALL REVIEWS ------------------- */
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find().toArray();
      res.send(reviews);
    });

    /* -------------------------------------------- USER ROUTE START ----------------------------------------------- */

    /* ------------------------------------------------------------------
    !------------------------- CREATE USER --------------------------- */
    app.post("/users", async (req, res) => {
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
            const result = await userCollection.updateOne(
              alreadyExist,
              updateDoc
            );
            res.send(result);
          }
        }
      }
    });

    /* ----------------------------------------------------------
      !-------------------------- SAVE TO CART ------------------- */
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
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

    /* --------------------------------------------------------------
    !---------------------- DELETE A ITEM FROM CART ------------------- */
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    /* --------------------------------------------------------------
    !---------------------- GET CARTS OF AN USER ------------------- */
    app.get("/carts", jwtVerify, async (req, res) => {
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
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });

    /*------------------------------------------------- ADMIN ROUTE ----------------------------------------  */
    // !/* ------------------------- GET ALL USER ---------------- */
    app.get("/all-users", jwtVerify, adminVerify, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // ! -------------------- MAKE USER ADMIN --------------------- !
    app.patch("/users/admin/:id", jwtVerify, adminVerify, async (req, res) => {
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

    // ! ---------------------------- ADD AN ITEM -------------------------!
    app.post("/add-item", jwtVerify, adminVerify, async (req, res) => {
      const data = req.body;
      const result = await menuCollection.insertOne(data);
      res.send(result);
    });

    // ! ------------------------------- REMOVE AN ITEM ----------------------!
    app.delete("/delete-item/:id", jwtVerify, adminVerify, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await menuCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bistro Boos Server is Running!!!");
});

app.listen(port, () => {
  console.log(`Bistro Boss Running On port ${port}`);
});
