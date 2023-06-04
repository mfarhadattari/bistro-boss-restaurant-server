require("dotenv").config();
const jwt = require("jsonwebtoken");

// !----------------- JWT TOKEN VERIFY ------------------! //
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

// ! -------------------------- ADMIN VERIFY MIDDLEWARE -----------------------  ! //
const adminVerify = async (req, res, next) => {
  const userCollection = req.userCollection;
  const email = req.decoded.email;

  if (email !== req.query.email) {
    return res.status(403).send({ error: true, message: "Access Forbidden" });
  }
  const query = { email: email };
  const result = await userCollection.findOne(query);
  if (result.role !== "admin") {
    return res.status(403).send({ error: true, message: "Access Forbidden" });
  }
  next();
};

module.exports = { jwtVerify, adminVerify };
