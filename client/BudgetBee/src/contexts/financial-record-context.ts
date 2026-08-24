import {createContext} from "react";

interface FinancialRecordContextType{
    records: const newRecord = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: Number(amount),
      transactionType,
      date,
      category,
      paymentMethod,
      notes: notes.trim(),
    };
}

export const FinancialRecordContext =createContext<>(undefined)