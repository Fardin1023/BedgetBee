import mongoose from "mongoose";

interface FinancialRecord {
  userID: string;
  description: string;
  amount: number;
  transactionType: string;
  date: Date;
  category: string;
  paymentMethod: string;
  notes?: string;
}

const financialRecordSchema = new mongoose.Schema<FinancialRecord>({
  userID: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  transactionType: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  notes: {
    type: String,
    required: false,
  },
});

const FinancialRecordModel = mongoose.model<FinancialRecord>(
  "FinancialRecord",
  financialRecordSchema
);

export default FinancialRecordModel;