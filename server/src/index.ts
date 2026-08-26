import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import financialRecordsRouter from "./routes/financial-records";

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error(
    "MONGO_URI is not defined in the .env file"
  );
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connection successfully");
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err
    );
  });

app.use(
  "/financial-records",
  financialRecordsRouter
);

app.listen(port, () => {
  console.log(
    `Server is running on port ${port}`
  );
});