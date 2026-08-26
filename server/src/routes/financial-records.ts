import { Router } from "express";
import FinancialRecordModel from "../schema/financial-record";

const router = Router();

/* ============================= */
/* GET ALL RECORDS BY USER ID    */
/* ============================= */

router.get(
  "/getAllByUserID/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      const records =
        await FinancialRecordModel
          .find({
            userID: userId,
          })
          .sort({
            date: -1,
          });

      return res
        .status(200)
        .json(records);
    } catch (error) {
      console.error(
        "GET records error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch financial records.",
        });
    }
  }
);

/* ============================= */
/* GET ONE RECORD                */
/* ============================= */

router.get(
  "/getById/:id",
  async (req, res) => {
    try {
      const record =
        await FinancialRecordModel.findById(
          req.params.id
        );

      if (!record) {
        return res
          .status(404)
          .json({
            message:
              "Financial record not found.",
          });
      }

      return res
        .status(200)
        .json(record);
    } catch (error) {
      console.error(
        "GET record error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch financial record.",
        });
    }
  }
);

/* ============================= */
/* CREATE RECORD                 */
/* ============================= */

router.post(
  "/create",
  async (req, res) => {
    try {
      console.log(
        "BODY RECEIVED:",
        req.body
      );

      const {
        userID,
        description,
        amount,
        transactionType,
        date,

        // Expense only
        category,
        paymentMethod,

        // Income only
        incomeType,

        // Optional
        notes,
      } = req.body;

      /* COMMON REQUIRED FIELDS */

      if (
        !userID ||
        !description ||
        amount === undefined ||
        !transactionType ||
        !date
      ) {
        return res
          .status(400)
          .json({
            message:
              "Missing required transaction information.",
          });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Amount must be greater than zero.",
          });
      }

      /* TRANSACTION TYPE */

      if (
        transactionType !==
          "Income" &&
        transactionType !==
          "Expense"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid transaction type.",
          });
      }

      /* INCOME VALIDATION */

      if (
        transactionType ===
          "Income" &&
        !incomeType
      ) {
        return res
          .status(400)
          .json({
            message:
              "Income type is required for income transactions.",
          });
      }

      /* EXPENSE VALIDATION */

      if (
        transactionType ===
          "Expense" &&
        (
          !category ||
          !paymentMethod
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Category and payment method are required for expense transactions.",
          });
      }

      const newRecord =
        new FinancialRecordModel({
          userID,

          description:
            String(
              description
            ).trim(),

          amount:
            numericAmount,

          transactionType,

          date:
            new Date(date),

          category:
            transactionType ===
            "Expense"
              ? category
              : undefined,

          paymentMethod:
            transactionType ===
            "Expense"
              ? paymentMethod
              : undefined,

          incomeType:
            transactionType ===
            "Income"
              ? incomeType
              : undefined,

          notes:
            notes
              ? String(
                  notes
                ).trim()
              : undefined,
        });

      const savedRecord =
        await newRecord.save();

      console.log(
        "SAVED RECORD:",
        savedRecord
      );

      return res
        .status(201)
        .json(savedRecord);
    } catch (error) {
      console.error(
        "CREATE RECORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to create financial record.",

          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
    }
  }
);

/* ============================= */
/* UPDATE RECORD                 */
/* ============================= */

router.put(
  "/update/:id",
  async (req, res) => {
    try {
      const updatedRecord =
        await FinancialRecordModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedRecord) {
        return res
          .status(404)
          .json({
            message:
              "Financial record not found.",
          });
      }

      return res
        .status(200)
        .json(updatedRecord);
    } catch (error) {
      console.error(
        "UPDATE record error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to update financial record.",
        });
    }
  }
);

/* ============================= */
/* DELETE RECORD                 */
/* ============================= */

router.delete(
  "/delete/:id",
  async (req, res) => {
    try {
      const deletedRecord =
        await FinancialRecordModel.findByIdAndDelete(
          req.params.id
        );

      if (!deletedRecord) {
        return res
          .status(404)
          .json({
            message:
              "Financial record not found.",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Financial record deleted successfully.",
        });
    } catch (error) {
      console.error(
        "DELETE record error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to delete financial record.",
        });
    }
  }
);

export default router;