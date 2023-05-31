const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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

    /* ----------------------- COLLECTION -------------------- */
    const menuCollection = client
      .db("bistro-boss-restaurant")
      .collection("foodsMenu");
    const reviewCollection = client
      .db("bistro-boss-restaurant")
      .collection("reviews");
    const cartCollection = client
      .db("bistro-boss-restaurant")
      .collection("carts");
    const userCollection = client
      .db("bistro-boss-restaurant")
      .collection("users");

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
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

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
