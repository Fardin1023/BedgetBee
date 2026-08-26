import { Router } from "express";

import FinancialRecordModel from "../schema/financial-record";

const router = Router();

/* ======================================== */
/* HELPER: MONTH RANGE                      */
/* ======================================== */

const getMonthRange = (
  dateValue: string
) => {
  const date =
    new Date(dateValue);

  const year =
    date.getUTCFullYear();

  const month =
    date.getUTCMonth();

  const start =
    new Date(
      Date.UTC(
        year,
        month,
        1
      )
    );

  const end =
    new Date(
      Date.UTC(
        year,
        month + 1,
        1
      )
    );

  return {
    start,
    end,
  };
};

/* ======================================== */
/* HELPER: MONTHLY TOTALS                   */
/* ======================================== */

const getMonthlyTotals =
  async (
    userID: string,
    dateValue: string,
    excludeID?: string
  ) => {
    const {
      start,
      end,
    } =
      getMonthRange(
        dateValue
      );

    const records =
      await FinancialRecordModel.find(
        {
          userID,

          date: {
            $gte: start,
            $lt: end,
          },
        }
      );

    const filteredRecords =
      excludeID
        ? records.filter(
            (record) =>
              record._id.toString() !==
              excludeID
          )
        : records;

    const income =
      filteredRecords
        .filter(
          (record) =>
            record.transactionType ===
            "Income"
        )
        .reduce(
          (
            total,
            record
          ) =>
            total +
            Number(
              record.amount
            ),
          0
        );

    const expense =
      filteredRecords
        .filter(
          (record) =>
            record.transactionType ===
            "Expense"
        )
        .reduce(
          (
            total,
            record
          ) =>
            total +
            Number(
              record.amount
            ),
          0
        );

    return {
      income,
      expense,

      remaining:
        income -
        expense,
    };
  };

/* ======================================== */
/* GET ALL RECORDS BY USER ID               */
/* ======================================== */

router.get(
  "/getAllByUserID/:userId",

  async (
    req,
    res
  ) => {
    try {
      const {
        userId,
      } =
        req.params;

      const records =
        await FinancialRecordModel
          .find({
            userID:
              userId,
          })
          .sort({
            date: -1,
            createdAt: -1,
          });

      return res
        .status(200)
        .json(records);
    } catch (error) {
      console.error(
        "GET RECORDS ERROR:",
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

/* ======================================== */
/* GET ONE RECORD                           */
/* ======================================== */

router.get(
  "/getById/:id",

  async (
    req,
    res
  ) => {
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
        "GET RECORD ERROR:",
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

/* ======================================== */
/* CREATE                                   */
/* ======================================== */

router.post(
  "/create",

  async (
    req,
    res
  ) => {
    try {
      const {
        userID,
        description,
        amount,
        transactionType,
        date,

        category,
        paymentMethod,

        incomeType,

        notes,
      } =
        req.body;

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

      /* CHECK TRANSACTION TYPE */

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

      /* ============================== */
      /* INCOME VALIDATION              */
      /* ============================== */

      if (
        transactionType ===
          "Income" &&
        !incomeType
      ) {
        return res
          .status(400)
          .json({
            message:
              "Income type is required.",
          });
      }

      /* ============================== */
      /* EXPENSE VALIDATION             */
      /* ============================== */

      if (
        transactionType ===
        "Expense"
      ) {
        if (
          !category ||
          !paymentMethod
        ) {
          return res
            .status(400)
            .json({
              message:
                "Category and payment method are required.",
            });
        }

        /*
          Check the user's available
          income for this month.
        */

        const budget =
          await getMonthlyTotals(
            userID,
            date
          );

        const available =
          Math.max(
            budget.remaining,
            0
          );

        if (
          numericAmount >
          available
        ) {
          return res
            .status(400)
            .json({
              message:
                `Expense limit exceeded. Only ${available.toFixed(
                  2
                )} BDT is available.`,
            });
        }
      }

      /* ============================== */
      /* CREATE DOCUMENT                */
      /* ============================== */

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

          /*
            Expense-only fields
          */

          ...(transactionType ===
          "Expense"
            ? {
                category,

                paymentMethod,
              }
            : {}),

          /*
            Income-only field
          */

          ...(transactionType ===
          "Income"
            ? {
                incomeType,
              }
            : {}),

          /*
            Optional notes
          */

          ...(notes
            ? {
                notes:
                  String(
                    notes
                  ).trim(),
              }
            : {}),
        });

      const savedRecord =
        await newRecord.save();

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

/* ======================================== */
/* UPDATE                                   */
/* ======================================== */

router.put(
  "/update/:id",

  async (
    req,
    res
  ) => {
    try {
      const {
        userID,
        description,
        amount,
        transactionType,
        date,

        category,
        paymentMethod,

        incomeType,

        notes,
      } =
        req.body;

      /* ============================== */
      /* COMMON VALIDATION              */
      /* ============================== */

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

      /* ============================== */
      /* FIND EXISTING RECORD           */
      /* ============================== */

      const existingRecord =
        await FinancialRecordModel.findById(
          req.params.id
        );

      if (
        !existingRecord
      ) {
        return res
          .status(404)
          .json({
            message:
              "Financial record not found.",
          });
      }

      /*
        Protect records from being
        updated through another userID.
      */

      if (
        existingRecord.userID !==
        userID
      ) {
        return res
          .status(403)
          .json({
            message:
              "You are not allowed to update this record.",
          });
      }

      /* ============================== */
      /* INCOME VALIDATION              */
      /* ============================== */

      if (
        transactionType ===
          "Income" &&
        !incomeType
      ) {
        return res
          .status(400)
          .json({
            message:
              "Income type is required.",
          });
      }

      /* ============================== */
      /* EXPENSE VALIDATION             */
      /* ============================== */

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
              "Category and payment method are required.",
          });
      }

      /* ============================== */
      /* MONTHLY LIMIT VALIDATION       */
      /* ============================== */

      const budget =
        await getMonthlyTotals(
          userID,
          date,
          req.params.id
        );

      const projectedIncome =
        budget.income +
        (
          transactionType ===
          "Income"
            ? numericAmount
            : 0
        );

      const projectedExpense =
        budget.expense +
        (
          transactionType ===
          "Expense"
            ? numericAmount
            : 0
        );

      if (
        projectedExpense >
        projectedIncome
      ) {
        return res
          .status(400)
          .json({
            message:
              "This change would make monthly expenses greater than monthly income.",
          });
      }

      /* ============================== */
      /* UPDATE COMMON FIELDS           */
      /* ============================== */

      existingRecord.description =
        String(
          description
        ).trim();

      existingRecord.amount =
        numericAmount;

      existingRecord.transactionType =
        transactionType;

      existingRecord.date =
        new Date(date);

      /* ============================== */
      /* UPDATE TYPE-SPECIFIC FIELDS    */
      /* ============================== */

      if (
        transactionType ===
        "Income"
      ) {
        /*
          Save income type.
        */

        existingRecord.set(
          "incomeType",
          incomeType
        );

        /*
          Remove expense-only fields.
        */

        existingRecord.set(
          "category",
          undefined
        );

        existingRecord.set(
          "paymentMethod",
          undefined
        );
      } else {
        /*
          Save expense information.
        */

        existingRecord.set(
          "category",
          category
        );

        existingRecord.set(
          "paymentMethod",
          paymentMethod
        );

        /*
          Remove income-only field.
        */

        existingRecord.set(
          "incomeType",
          undefined
        );
      }

      /* ============================== */
      /* NOTES                          */
      /* ============================== */

      if (
        notes &&
        String(
          notes
        ).trim()
      ) {
        existingRecord.set(
          "notes",
          String(
            notes
          ).trim()
        );
      } else {
        existingRecord.set(
          "notes",
          undefined
        );
      }

      /* ============================== */
      /* SAVE                           */
      /* ============================== */

      const updatedRecord =
        await existingRecord.save();

      return res
        .status(200)
        .json(updatedRecord);
    } catch (error) {
      console.error(
        "UPDATE RECORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to update financial record.",

          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
    }
  }
);

/* ======================================== */
/* DELETE                                   */
/* ======================================== */

router.delete(
  "/delete/:id",

  async (
    req,
    res
  ) => {
    try {
      const deletedRecord =
        await FinancialRecordModel.findByIdAndDelete(
          req.params.id
        );

      if (
        !deletedRecord
      ) {
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
        "DELETE RECORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to delete financial record.",

          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
    }
  }
);

export default router;