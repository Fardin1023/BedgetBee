//fardinkamran915_db_user
//wecZJiVxX9aWcXIEs
//mongodb+srv://fardinkamran915_db_user:<db_password>@budgetbee.crwvnzc.mongodb.net/

import express from "express";
import mongoose from "mongoose";
import financialRecordsRouter from "./routes/financial-records";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const mongoURI: string = "mongodb+srv://fardinkamran915_db_user:<db_password>@budgetbee.crwvnzc.mongodb.net/";

mongoose.connect(mongoURI).then(() => console.log("MongoDB connection successfully")).catch((err) => console.error("MongoDB connection error:", err));

app.use("/financial-records", financialRecordsRouter);;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});