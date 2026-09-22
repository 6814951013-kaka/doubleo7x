require("dotenv").config();
const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

// Keep the Atlas connection warm while a Vercel Function instance is reused.
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
