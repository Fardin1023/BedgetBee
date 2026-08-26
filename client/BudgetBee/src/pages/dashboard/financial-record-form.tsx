import { useState } from "react";
import type { FormEvent } from "react";

import { useFinancialRecordContext } from "../../contexts/financial-record-context";

export const FinancialRecordForm = () => {
  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [
    transactionType,
    setTransactionType,
  ] = useState("Expense");

  const [date, setDate] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const { addRecord } =
    useFinancialRecordContext();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !description.trim() ||
      !amount ||
      !date ||
      !category ||
      !paymentMethod
    ) {
      return;
    }

    const newRecord = {
      description:
        description.trim(),

      amount:
        Number(amount),

      transactionType,

      date,

      category,

      paymentMethod,

      notes:
        notes.trim(),
    };

    const success =
      await addRecord(newRecord);

    if (!success) {
      alert(
        "Could not save the financial record."
      );

      return;
    }

    setDescription("");
    setAmount("");
    setTransactionType("Expense");
    setDate("");
    setCategory("");
    setPaymentMethod("");
    setNotes("");
  };

  return (
    <div className="form-container">
      <h2>Add Financial Record</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-field">
          <label htmlFor="description">
            Description
          </label>

          <input
            id="description"
            type="text"
            placeholder="e.g. Grocery shopping"
            required
            className="form-input"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="amount">
            Amount
          </label>

          <input
            id="amount"
            type="number"
            placeholder="e.g. 500"
            min="0.01"
            step="0.01"
            required
            className="form-input"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="transactionType">
            Transaction Type
          </label>

          <select
            id="transactionType"
            required
            className="form-input"
            value={transactionType}
            onChange={(event) =>
              setTransactionType(
                event.target.value
              )
            }
          >
            <option value="Expense">
              Expense
            </option>

            <option value="Income">
              Income
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            type="date"
            required
            className="form-input"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="category">
            Category
          </label>

          <select
            id="category"
            required
            className="form-input"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            <option value="">
              Select a Category
            </option>

            <option value="Food">
              Food
            </option>

            <option value="Rent">
              Rent
            </option>

            <option value="Shopping">
              Shopping
            </option>

            <option value="Transportation">
              Transportation
            </option>

            <option value="Utilities">
              Utilities
            </option>

            <option value="Entertainment">
              Entertainment
            </option>

            <option value="Healthcare">
              Healthcare
            </option>

            <option value="Education">
              Education
            </option>

            <option value="Salary">
              Salary
            </option>

            <option value="Investment">
              Investment
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="paymentMethod">
            Payment Method
          </label>

          <select
            id="paymentMethod"
            required
            className="form-input"
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                event.target.value
              )
            }
          >
            <option value="">
              Select a Payment Method
            </option>

            <option value="Cash">
              Cash
            </option>

            <option value="Credit Card">
              Credit Card
            </option>

            <option value="Debit Card">
              Debit Card
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="Mobile Banking">
              Mobile Banking
            </option>

            <optgroup label="Digital Wallet">
              <option value="bKash">
                bKash
              </option>

              <option value="Nagad">
                Nagad
              </option>
            </optgroup>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="notes">
            Notes
          </label>

          <textarea
            id="notes"
            placeholder="Add an optional note..."
            className="form-input"
            rows={3}
            maxLength={250}
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value
              )
            }
          />
        </div>

        <button
          type="submit"
          className="button"
        >
          Add Record
        </button>
      </form>
    </div>
  );
};