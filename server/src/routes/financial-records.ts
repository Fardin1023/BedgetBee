import express, { Request, Response } from "express";
import FinancialRecordModel from "../schema/financial-record";

const router = express.Router();


// ==============================
// GET ALL RECORDS BY USER ID
// ==============================

router.get(
  "/getAllByUserID/:userId",
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;

      const records = await FinancialRecordModel.find({
        userID: userId,
      });

      if (records.length === 0) {
        return res.status(404).json({
          message: "No financial records found",
        });
      }

      return res.status(200).json(records);

    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);


// ==============================
// GET ONE RECORD BY ID
// ==============================

router.get(
  "/getById/:id",
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;

      const record = await FinancialRecordModel.findById(id);

      if (!record) {
        return res.status(404).json({
          message: "Financial record not found",
        });
      }

      return res.status(200).json(record);

    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);


// ==============================
// CREATE FINANCIAL RECORD
// ==============================

router.post(
  "/create",
  async (req: Request, res: Response) => {
    try {

      const {
        userID,
        description,
        amount,
        transactionType,
        date,
        category,
        paymentMethod,
        notes,
      } = req.body;

      if (
        !userID ||
        !description ||
        amount === undefined ||
        !transactionType ||
        !date ||
        !category ||
        !paymentMethod
      ) {
        return res.status(400).json({
          message: "Required fields are missing",
        });
      }

      const newRecord = new FinancialRecordModel({
        userID,
        description,
        amount,
        transactionType,
        date,
        category,
        paymentMethod,
        notes,
      });

      const savedRecord = await newRecord.save();

      return res.status(201).json(savedRecord);

    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);


// ==============================
// UPDATE FINANCIAL RECORD
// ==============================

router.put(
  "/update/:id",
  async (req: Request, res: Response) => {
    try {

      const id = req.params.id as string;

      const {
        userID,
        description,
        amount,
        transactionType,
        date,
        category,
        paymentMethod,
        notes,
      } = req.body;

      const updatedRecord =
        await FinancialRecordModel.findByIdAndUpdate(
          id,
          {
            userID,
            description,
            amount,
            transactionType,
            date,
            category,
            paymentMethod,
            notes,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedRecord) {
        return res.status(404).json({
          message: "Financial record not found",
        });
      }

      return res.status(200).json(updatedRecord);

    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);


// ==============================
// DELETE FINANCIAL RECORD
// ==============================

router.delete(
  "/delete/:id",
  async (req: Request, res: Response) => {
    try {

      const id = req.params.id as string;

      const deletedRecord =
        await FinancialRecordModel.findByIdAndDelete(id);

      if (!deletedRecord) {
        return res.status(404).json({
          message: "Financial record not found",
        });
      }

      return res.status(200).json({
        message: "Financial record deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);


export default router;