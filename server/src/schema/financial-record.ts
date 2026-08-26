import mongoose from "mongoose";

export interface FinancialRecord {
  userID: string;

  description: string;

  amount: number;

  transactionType:
    | "Income"
    | "Expense";

  date: Date;

  // Expense-only fields
  category?: string | undefined;

  paymentMethod?: string | undefined;

  // Income-only field
  incomeType?: string | undefined;

  // Optional for both
  notes?: string | undefined;
}

const financialRecordSchema =
  new mongoose.Schema<FinancialRecord>(
    {
      userID: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0.01,
      },

      transactionType: {
        type: String,
        required: true,

        enum: [
          "Income",
          "Expense",
        ],
      },

      date: {
        type: Date,
        required: true,
      },

      // Expense only
      category: {
        type: String,
        required: false,
      },

      paymentMethod: {
        type: String,
        required: false,
      },

      // Income only
      incomeType: {
        type: String,
        required: false,
      },

      // Optional for both
      notes: {
        type: String,
        required: false,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

const FinancialRecordModel =
  mongoose.model<FinancialRecord>(
    "FinancialRecord",
    financialRecordSchema
  );

export default FinancialRecordModel;