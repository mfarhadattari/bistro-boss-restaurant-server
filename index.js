const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//! middleware
app.use(cors());
app.use(express.json());

// ! Import other file for route here
const publicRoutes = require("./routes/public");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const otherRoute = require("./routes/other");

// ! MongoDB URI
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
    app.use((req, res, next) => {
      req.menuCollection = DB.collection("foodsMenu");
      req.reviewCollection = DB.collection("reviews");
      req.cartCollection = DB.collection("carts");
      req.userCollection = DB.collection("users");
      req.paymentCollection = DB.collection("payments");
      next();
    });

    //! Route From Other File Here
    app.use("/", publicRoutes);
    app.use("/", userRoute);
    app.use("/", adminRoute);
    app.use("/", otherRoute);

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
