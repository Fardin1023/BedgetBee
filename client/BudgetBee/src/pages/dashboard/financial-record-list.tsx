import {
  useMemo,
  useState,
} from "react";

import {
  useFinancialRecordContext,
} from "../../contexts/financial-record-context";

import type {
  FinancialRecord,
} from "../../contexts/financial-record-context";

import "./financial-record-list.css";

interface EditFormState {
  description: string;
  amount: string;
  date: string;

  category: string;
  paymentMethod: string;

  incomeType: string;

  notes: string;
}

const formatMoney = (
  amount: number
) => {
  return Number(
    amount
  ).toLocaleString(
    undefined,
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  );
};

const getMonthKey = (
  value: string
) => {
  return value.slice(
    0,
    7
  );
};

const getInputDate = (
  value: string
) => {
  return value.slice(
    0,
    10
  );
};

const displayDate = (
  value: string
) => {
  const datePart =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    datePart
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString();
};

export const FinancialRecordList =
  () => {
    const {
      records,
      updateRecord,
      deleteRecord,
    } =
      useFinancialRecordContext();

    const [
      editingRecord,
      setEditingRecord,
    ] =
      useState<
        FinancialRecord
        | null
      >(null);

    const [
      editForm,
      setEditForm,
    ] =
      useState<
        EditFormState
      >({
        description:
          "",

        amount:
          "",

        date:
          "",

        category:
          "",

        paymentMethod:
          "",

        incomeType:
          "",

        notes:
          "",
      });

    const [
      editError,
      setEditError,
    ] =
      useState("");

    const [
      editing,
      setEditing,
    ] =
      useState(false);

    const [
      deletingRecord,
      setDeletingRecord,
    ] =
      useState<
        FinancialRecord
        | null
      >(null);

    const [
      deleting,
      setDeleting,
    ] =
      useState(false);

    const [
      deleteError,
      setDeleteError,
    ] =
      useState("");

    /* ========================== */
    /* OPEN EDIT                  */
    /* ========================== */

    const startEditing = (
      record:
        FinancialRecord
    ) => {
      setEditingRecord(
        record
      );

      setEditError(
        ""
      );

      setEditForm({
        description:
          record.description,

        amount:
          String(
            record.amount
          ),

        date:
          getInputDate(
            record.date
          ),

        category:
          record.category ||
          "",

        paymentMethod:
          record.paymentMethod ||
          "",

        incomeType:
          record.incomeType ||
          "",

        notes:
          record.notes ||
          "",
      });
    };

    const closeEditModal =
      () => {
        if (editing) {
          return;
        }

        setEditingRecord(
          null
        );

        setEditError(
          ""
        );
      };

    /* ========================== */
    /* MONTH TOTALS EXCLUDING     */
    /* CURRENT RECORD             */
    /* ========================== */

    const editMonthBudget =
      useMemo(() => {
        if (
          !editingRecord ||
          !editForm.date
        ) {
          return {
            income:
              0,

            expense:
              0,

            remaining:
              0,
          };
        }

        const targetMonth =
          getMonthKey(
            editForm.date
          );

        const otherRecords =
          records.filter(
            (
              record
            ) =>
              record._id !==
                editingRecord._id &&
              getMonthKey(
                record.date
              ) ===
                targetMonth
          );

        const income =
          otherRecords
            .filter(
              (
                record
              ) =>
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
          otherRecords
            .filter(
              (
                record
              ) =>
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
      }, [
        records,
        editingRecord,
        editForm.date,
      ]);

    /* ========================== */
    /* SAVE EDIT                  */
    /* ========================== */

    const saveEdit =
      async () => {
        if (
          !editingRecord?._id
        ) {
          return;
        }

        setEditError(
          ""
        );

        const amount =
          Number(
            editForm.amount
          );

        if (
          !editForm.description.trim() ||
          !editForm.date
        ) {
          setEditError(
            "Description and date are required."
          );

          return;
        }

        if (
          Number.isNaN(
            amount
          ) ||
          amount <=
            0
        ) {
          setEditError(
            "Amount must be greater than zero."
          );

          return;
        }

        /* ====================== */
        /* INCOME EDIT            */
        /* ====================== */

        if (
          editingRecord.transactionType ===
          "Income"
        ) {
          if (
            !editForm.incomeType
          ) {
            setEditError(
              "Please select an income type."
            );

            return;
          }

          /*
            If income is reduced,
            expenses must still be
            covered.
          */

          const projectedIncome =
            editMonthBudget.income +
            amount;

          if (
            editMonthBudget.expense >
            projectedIncome
          ) {
            setEditError(
              `You cannot reduce this income to ৳${formatMoney(
                amount
              )}, because monthly expenses would exceed the available income.`
            );

            return;
          }

          setEditing(
            true
          );

          const success =
            await updateRecord(
              editingRecord._id,

              {
                description:
                  editForm.description.trim(),

                amount,

                transactionType:
                  "Income",

                date:
                  editForm.date,

                incomeType:
                  editForm.incomeType,

                notes:
                  editForm.notes.trim() ||
                  undefined,
              }
            );

          setEditing(
            false
          );

          if (!success) {
            setEditError(
              "The income could not be updated. Please try again."
            );

            return;
          }

          setEditingRecord(
            null
          );

          return;
        }

        /* ====================== */
        /* EXPENSE EDIT           */
        /* ====================== */

        if (
          !editForm.category ||
          !editForm.paymentMethod
        ) {
          setEditError(
            "Expense category and payment method are required."
          );

          return;
        }

        const available =
          Math.max(
            editMonthBudget.remaining,
            0
          );

        if (
          amount >
          available
        ) {
          setEditError(
            `Expense limit exceeded. Only ৳${formatMoney(
              available
            )} is available for this month.`
          );

          return;
        }

        setEditing(
          true
        );

        const success =
          await updateRecord(
            editingRecord._id,

            {
              description:
                editForm.description.trim(),

              amount,

              transactionType:
                "Expense",

              date:
                editForm.date,

              category:
                editForm.category,

              paymentMethod:
                editForm.paymentMethod,

              notes:
                editForm.notes.trim() ||
                undefined,
            }
          );

        setEditing(
          false
        );

        if (!success) {
          setEditError(
            "The expense could not be updated. Please try again."
          );

          return;
        }

        setEditingRecord(
          null
        );
      };

    /* ========================== */
    /* DELETE                    */
    /* ========================== */

    const requestDelete = (
      record:
        FinancialRecord
    ) => {
      setDeletingRecord(
        record
      );

      setDeleteError(
        ""
      );
    };

    const confirmDelete =
      async () => {
        if (
          !deletingRecord?._id
        ) {
          return;
        }

        setDeleting(
          true
        );

        setDeleteError(
          ""
        );

        const success =
          await deleteRecord(
            deletingRecord._id
          );

        setDeleting(
          false
        );

        if (!success) {
          setDeleteError(
            "The transaction could not be deleted. Please try again."
          );

          return;
        }

        setDeletingRecord(
          null
        );
      };

    /* ========================== */
    /* NO RECORDS                */
    /* ========================== */

    if (
      records.length ===
      0
    ) {
      return (
        <div className="financial-record-list">
          <div className="record-list-title">
            <div>
              <p className="section-label">
                TRANSACTION HISTORY
              </p>

              <h2>
                Financial Records
              </h2>
            </div>
          </div>

          <div className="empty-records">
            <div className="empty-records-icon">
              🐝
            </div>

            <h3>
              No transactions yet
            </h3>

            <p>
              Your Income and Expense
              records will appear here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="financial-record-list">
          <div className="record-list-title">
            <div>
              <p className="section-label">
                TRANSACTION HISTORY
              </p>

              <h2>
                Financial Records
              </h2>
            </div>

            <span className="record-count">
              {records.length}{" "}
              {records.length ===
              1
                ? "record"
                : "records"}
            </span>
          </div>

          <table className="records-table">
            <thead>
              <tr>
                <th>
                  Date
                </th>

                <th>
                  Description
                </th>

                <th>
                  Type
                </th>

                <th>
                  Category /
                  Income Type
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Notes
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {records.map(
                (
                  record
                ) => {
                  const isIncome =
                    record.transactionType ===
                    "Income";

                  return (
                    <tr
                      key={
                        record._id
                      }
                    >
                      <td>
                        {displayDate(
                          record.date
                        )}
                      </td>

                      <td>
                        {
                          record.description
                        }
                      </td>

                      <td>
                        <span
                          className={`transaction-badge ${
                            isIncome
                              ? "income"
                              : "expense"
                          }`}
                        >
                          {
                            record.transactionType
                          }
                        </span>
                      </td>

                      <td>
                        {isIncome
                          ? record.incomeType ||
                            "-"
                          : record.category ||
                            "-"}
                      </td>

                      <td>
                        {isIncome
                          ? "-"
                          : record.paymentMethod ||
                            "-"}
                      </td>

                      <td>
                        <strong
                          className={
                            isIncome
                              ? "income-text"
                              : "expense-text"
                          }
                        >
                          {isIncome
                            ? "+"
                            : "-"}
                          ৳
                          {formatMoney(
                            record.amount
                          )}
                        </strong>
                      </td>

                      <td>
                        {record.notes ||
                          "-"}
                      </td>

                      <td>
                        <div className="record-actions">
                          <button
                            type="button"
                            className="edit-record-button"
                            onClick={() =>
                              startEditing(
                                record
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              requestDelete(
                                record
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* ====================== */}
        {/* EDIT MODAL             */}
        {/* ====================== */}

        {editingRecord && (
          <div className="modal-overlay">
            <div className="edit-record-modal">
              <div className="edit-modal-header">
                <div>
                  <p className="section-label">
                    EDIT{" "}
                    {editingRecord.transactionType.toUpperCase()}
                  </p>

                  <h2>
                    Update Transaction
                  </h2>

                  <p>
                    Change the details
                    below and save your
                    changes.
                  </p>
                </div>

                <button
                  type="button"
                  className="edit-modal-close"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    editing
                  }
                >
                  ×
                </button>
              </div>

              {/* DESCRIPTION */}

              <div className="form-field">
                <label htmlFor="edit-description">
                  Description
                </label>

                <input
                  id="edit-description"
                  className="form-input"
                  type="text"
                  value={
                    editForm.description
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event.target.value,
                      })
                    )
                  }
                />
              </div>

              {/* AMOUNT */}

              <div className="form-field">
                <label htmlFor="edit-amount">
                  Amount
                </label>

                <input
                  id="edit-amount"
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    editForm.amount
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        amount:
                          event.target.value,
                      })
                    )
                  }
                />
              </div>

              {/* DATE */}

              <div className="form-field">
                <label htmlFor="edit-date">
                  Date
                </label>

                <input
                  id="edit-date"
                  className="form-input"
                  type="date"
                  value={
                    editForm.date
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        date:
                          event.target.value,
                      })
                    )
                  }
                />
              </div>

              {/* INCOME FIELDS */}

              {editingRecord.transactionType ===
                "Income" && (
                <div className="form-field">
                  <label htmlFor="edit-income-type">
                    Income Type
                  </label>

                  <select
                    id="edit-income-type"
                    className="form-input"
                    value={
                      editForm.incomeType
                    }
                    onChange={(
                      event
                    ) =>
                      setEditForm(
                        (
                          current
                        ) => ({
                          ...current,

                          incomeType:
                            event.target.value,
                        })
                      )
                    }
                  >
                    <option value="">
                      Select income type
                    </option>

                    <option value="Tuition">
                      Tuition
                    </option>

                    <option value="Job">
                      Job
                    </option>

                    <option value="Business">
                      Business
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              )}

              {/* EXPENSE FIELDS */}

              {editingRecord.transactionType ===
                "Expense" && (
                <>
                  <div className="edit-budget-preview">
                    <div>
                      <span>
                        Available limit
                      </span>

                      <strong className="positive-balance">
                        ৳
                        {formatMoney(
                          Math.max(
                            editMonthBudget.remaining,
                            0
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        New expense
                      </span>

                      <strong className="expense-text">
                        ৳
                        {formatMoney(
                          Number(
                            editForm.amount
                          ) ||
                            0
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="edit-category">
                      Expense Category
                    </label>

                    <select
                      id="edit-category"
                      className="form-input"
                      value={
                        editForm.category
                      }
                      onChange={(
                        event
                      ) =>
                        setEditForm(
                          (
                            current
                          ) => ({
                            ...current,

                            category:
                              event.target.value,
                          })
                        )
                      }
                    >
                      <option value="">
                        Select category
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

                      <option value="Investment">
                        Investment
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="edit-payment">
                      Payment Method
                    </label>

                    <select
                      id="edit-payment"
                      className="form-input"
                      value={
                        editForm.paymentMethod
                      }
                      onChange={(
                        event
                      ) =>
                        setEditForm(
                          (
                            current
                          ) => ({
                            ...current,

                            paymentMethod:
                              event.target.value,
                          })
                        )
                      }
                    >
                      <option value="">
                        Select payment method
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

                      <option value="bKash">
                        bKash
                      </option>

                      <option value="Nagad">
                        Nagad
                      </option>
                    </select>
                  </div>
                </>
              )}

              {/* NOTES */}

              <div className="form-field">
                <label htmlFor="edit-notes">
                  Notes

                  <span className="optional-text">
                    Optional
                  </span>
                </label>

                <textarea
                  id="edit-notes"
                  className="form-input"
                  value={
                    editForm.notes
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        notes:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Add notes..."
                />
              </div>

              {editError && (
                <div className="limit-error">
                  {editError}
                </div>
              )}

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    editing
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-button"
                  onClick={() =>
                    void saveEdit()
                  }
                  disabled={
                    editing
                  }
                >
                  {editing
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================== */}
        {/* DELETE MODAL           */}
        {/* ====================== */}

        {deletingRecord && (
          <div className="modal-overlay">
            <div className="delete-confirm-modal">
              <div className="delete-warning-icon">
                !
              </div>

              <p className="section-label delete-label">
                DELETE TRANSACTION
              </p>

              <h2>
                Delete this record?
              </h2>

              <p className="delete-confirm-description">
                This action cannot be
                undone.
              </p>

              <div className="delete-record-preview">
                <div>
                  <span>
                    Description
                  </span>

                  <strong>
                    {
                      deletingRecord.description
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Type
                  </span>

                  <strong
                    className={
                      deletingRecord.transactionType ===
                      "Income"
                        ? "income-text"
                        : "expense-text"
                    }
                  >
                    {
                      deletingRecord.transactionType
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Amount
                  </span>

                  <strong>
                    ৳
                    {formatMoney(
                      deletingRecord.amount
                    )}
                  </strong>
                </div>
              </div>

              {deleteError && (
                <div className="limit-error">
                  {deleteError}
                </div>
              )}

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  disabled={
                    deleting
                  }
                  onClick={() =>
                    setDeletingRecord(
                      null
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="final-delete-button"
                  disabled={
                    deleting
                  }
                  onClick={() =>
                    void confirmDelete()
                  }
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Transaction"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };