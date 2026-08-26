import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import financialRecordsRouter from "./routes/financial-records";

const app = express();

const port = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());

// Allow JSON request bodies
app.use(express.json());

// IMPORTANT:
// Replace this with your REAL MongoDB Atlas connection string
const mongoURI: string =
  "mongodb+srv://fardinkamran915_db_user:BudgetBee12345@budgetbee.crwvnzc.mongodb.net/";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connection successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Financial records routes
app.use("/financial-records", financialRecordsRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});