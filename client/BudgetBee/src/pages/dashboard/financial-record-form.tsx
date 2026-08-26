import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useFinancialRecordContext,
} from "../../contexts/financial-record-context";

type FormMode =
  | "Income"
  | "Expense";

type ConfirmationStage =
  | "confirm"
  | "loading"
  | "success";

interface PendingRecord {
  description: string;

  amount: number;

  transactionType:
    | "Income"
    | "Expense";

  date: string;

  category?: string;

  paymentMethod?: string;

  incomeType?: string;

  notes?: string;
}


/* ============================== */
/* DATE HELPERS */
/* ============================== */

const getToday = () => {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getMonthKey = (
  value: string
) => {
  if (
    /^\d{4}-\d{2}/.test(
      value
    )
  ) {
    return value.slice(
      0,
      7
    );
  }

  const date =
    new Date(
      value
    );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}`;
};

const getMonthLabel = (
  value: string
) => {
  const [
    year,
    month,
  ] =
    getMonthKey(
      value
    )
      .split("-")
      .map(
        Number
      );

  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString(
    undefined,
    {
      month:
        "long",

      year:
        "numeric",
    }
  );
};

const formatMoney = (
  amount: number
) => {
  return amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  );
};

const delay = (
  milliseconds: number
) =>
  new Promise<void>(
    (
      resolve
    ) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );


/* ============================== */
/* COMPONENT */
/* ============================== */

export const FinancialRecordForm =
  () => {
    const {
      records,
      addRecord,
    } =
      useFinancialRecordContext();

    /*
      Income is the default because
      the user should enter income
      before creating expenses.
    */

    const [
      formMode,
      setFormMode,
    ] =
      useState<FormMode>(
        "Income"
      );

    const [
      description,
      setDescription,
    ] =
      useState("");

    const [
      amount,
      setAmount,
    ] =
      useState("");

    const [
      date,
      setDate,
    ] =
      useState(
        getToday()
      );

    /*
      EXPENSE FIELDS
    */

    const [
      category,
      setCategory,
    ] =
      useState("");

    const [
      paymentMethod,
      setPaymentMethod,
    ] =
      useState("");

    /*
      INCOME FIELD
    */

    const [
      incomeType,
      setIncomeType,
    ] =
      useState("");

    /*
      COMMON OPTIONAL FIELD
    */

    const [
      notes,
      setNotes,
    ] =
      useState("");

    const [
      pendingRecord,
      setPendingRecord,
    ] =
      useState<
        PendingRecord
        | null
      >(null);

    const [
      confirmationStage,
      setConfirmationStage,
    ] =
      useState<
        ConfirmationStage
      >(
        "confirm"
      );

    const [
      formError,
      setFormError,
    ] =
      useState("");

    const [
      saveError,
      setSaveError,
    ] =
      useState("");


    /* ============================== */
    /* MONTH CALCULATION              */
    /* ============================== */

    const calculateMonthTotals =
      (
        targetDate:
          string
      ) => {
        const targetMonth =
          getMonthKey(
            targetDate
          );

        const monthRecords =
          records.filter(
            (
              record
            ) =>
              getMonthKey(
                record.date
              ) ===
              targetMonth
          );

        const income =
          monthRecords
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
          monthRecords
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
      };


    const monthBudget =
      useMemo(
        () => {
          const targetMonth =
            getMonthKey(
              date
            );

          const monthRecords =
            records.filter(
              (
                record
              ) =>
                getMonthKey(
                  record.date
                ) ===
                targetMonth
            );

          const income =
            monthRecords
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
            monthRecords
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
        },
        [
          records,
          date,
        ]
      );


    const safeRemaining =
      Math.max(
        monthBudget.remaining,
        0
      );


    const usagePercentage =
      monthBudget.income >
      0
        ? Math.min(
            (
              monthBudget.expense /
              monthBudget.income
            ) *
              100,
            100
          )
        : 0;


    const numericAmount =
      Number(
        amount
      ) || 0;


    const projectedRemaining =
      formMode ===
      "Expense"
        ? safeRemaining -
          numericAmount
        : safeRemaining +
          numericAmount;


    /* ============================== */
    /* RESET                          */
    /* ============================== */

    const resetFields =
      () => {
        setDescription(
          ""
        );

        setAmount(
          ""
        );

        setDate(
          getToday()
        );

        setCategory(
          ""
        );

        setPaymentMethod(
          ""
        );

        setIncomeType(
          ""
        );

        setNotes(
          ""
        );

        setFormError(
          ""
        );
      };


    const changeMode = (
      mode:
        FormMode
    ) => {
      setFormMode(
        mode
      );

      setFormError(
        ""
      );

      setSaveError(
        ""
      );

      /*
        Clear type-specific fields
        when switching forms.
      */

      setCategory(
        ""
      );

      setPaymentMethod(
        ""
      );

      setIncomeType(
        ""
      );
    };


    /* ============================== */
    /* FORM SUBMISSION                */
    /* ============================== */

    const handleSubmit = (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setFormError(
        ""
      );

      setSaveError(
        ""
      );

      const parsedAmount =
        Number(
          amount
        );


      /*
        COMMON VALIDATION
      */

      if (
        !description.trim() ||
        !amount ||
        !date
      ) {
        setFormError(
          "Please complete all required fields."
        );

        return;
      }


      if (
        Number.isNaN(
          parsedAmount
        ) ||
        parsedAmount <= 0
      ) {
        setFormError(
          "Amount must be greater than 0."
        );

        return;
      }


      /* ============================== */
      /* INCOME VALIDATION              */
      /* ============================== */

      if (
        formMode ===
        "Income"
      ) {
        if (
          !incomeType
        ) {
          setFormError(
            "Please select an income type."
          );

          return;
        }


        setPendingRecord({
          description:
            description.trim(),

          amount:
            parsedAmount,

          transactionType:
            "Income",

          date,

          incomeType,

          notes:
            notes.trim() ||
            undefined,
        });

        setConfirmationStage(
          "confirm"
        );

        return;
      }


      /* ============================== */
      /* EXPENSE VALIDATION             */
      /* ============================== */

      if (
        !category ||
        !paymentMethod
      ) {
        setFormError(
          "Please select both an expense category and payment method."
        );

        return;
      }


      if (
        monthBudget.income <=
        0
      ) {
        setFormError(
          `You have not added any income for ${getMonthLabel(
            date
          )}. Add income before recording expenses.`
        );

        return;
      }


      if (
        parsedAmount >
        safeRemaining
      ) {
        setFormError(
          `Expense limit exceeded. You only have ৳${formatMoney(
            safeRemaining
          )} remaining for ${getMonthLabel(
            date
          )}.`
        );

        return;
      }


      setPendingRecord({
        description:
          description.trim(),

        amount:
          parsedAmount,

        transactionType:
          "Expense",

        date,

        category,

        paymentMethod,

        notes:
          notes.trim() ||
          undefined,
      });

      setConfirmationStage(
        "confirm"
      );
    };


    /* ============================== */
    /* MODAL                          */
    /* ============================== */

    const closeModal =
      () => {
        if (
          confirmationStage ===
          "loading"
        ) {
          return;
        }

        setPendingRecord(
          null
        );

        setSaveError(
          ""
        );

        setConfirmationStage(
          "confirm"
        );
      };


    const handleConfirm =
      async () => {
        if (
          !pendingRecord
        ) {
          return;
        }


        /*
          Recheck the spending limit
          just before saving an
          expense.
        */

        if (
          pendingRecord.transactionType ===
          "Expense"
        ) {
          const latestBudget =
            calculateMonthTotals(
              pendingRecord.date
            );

          const latestRemaining =
            Math.max(
              latestBudget.remaining,
              0
            );


          if (
            pendingRecord.amount >
            latestRemaining
          ) {
            setSaveError(
              `This expense cannot be added. Only ৳${formatMoney(
                latestRemaining
              )} is currently available.`
            );

            return;
          }
        }


        setSaveError(
          ""
        );

        setConfirmationStage(
          "loading"
        );


        const [
          savedSuccessfully,
        ] =
          await Promise.all([
            addRecord(
              pendingRecord
            ),

            delay(
              1000
            ),
          ]);


        if (
          !savedSuccessfully
        ) {
          setConfirmationStage(
            "confirm"
          );

          setSaveError(
            "The financial record could not be saved. Please try again."
          );

          return;
        }


        setConfirmationStage(
          "success"
        );


        resetFields();


        await delay(
          1200
        );


        setPendingRecord(
          null
        );

        setConfirmationStage(
          "confirm"
        );
      };


    return (
      <>
        <form
          className="form-container"
          onSubmit={
            handleSubmit
          }
        >
          {/* ======================== */}
          {/* HEADER                   */}
          {/* ======================== */}

          <div className="section-heading">
            <div>
              <p className="section-label">
                NEW TRANSACTION
              </p>

              <h2>
                {formMode ===
                "Income"
                  ? "Add Income"
                  : "Add Expense"}
              </h2>
            </div>

            <div className="form-icon">
              {formMode ===
              "Income"
                ? "↗"
                : "↘"}
            </div>
          </div>


          {/* ======================== */}
          {/* INCOME / EXPENSE SWITCH  */}
          {/* ======================== */}

          <div className="chart-tabs">
            <button
              type="button"
              className={`chart-tab ${
                formMode ===
                "Income"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                changeMode(
                  "Income"
                )
              }
            >
              Income
            </button>

            <button
              type="button"
              className={`chart-tab ${
                formMode ===
                "Expense"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                changeMode(
                  "Expense"
                )
              }
            >
              Expense
            </button>
          </div>


          {/* ======================== */}
          {/* INCOME FORM              */}
          {/* ======================== */}

          {formMode ===
            "Income" && (
            <>
              <div className="form-field">
                <label htmlFor="incomeDescription">
                  Income Description
                </label>

                <input
                  id="incomeDescription"
                  type="text"
                  className="form-input"
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. August salary"
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="incomeAmount">
                  Income Amount
                </label>

                <input
                  id="incomeAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  value={
                    amount
                  }
                  onChange={(
                    event
                  ) => {
                    setAmount(
                      event.target
                        .value
                    );

                    setFormError(
                      ""
                    );
                  }}
                  placeholder="0.00"
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="incomeType">
                  Income Type
                </label>

                <select
                  id="incomeType"
                  className="form-input"
                  value={
                    incomeType
                  }
                  onChange={(
                    event
                  ) =>
                    setIncomeType(
                      event.target
                        .value
                    )
                  }
                  required
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


              <div className="form-field">
                <label htmlFor="incomeDate">
                  Income Date
                </label>

                <input
                  id="incomeDate"
                  type="date"
                  className="form-input"
                  value={
                    date
                  }
                  onChange={(
                    event
                  ) => {
                    setDate(
                      event.target
                        .value
                    );

                    setFormError(
                      ""
                    );
                  }}
                  required
                />
              </div>


              {/* CURRENT MONTH LIMIT */}

              <div className="form-budget-panel">
                <div className="form-budget-title">
                  <div>
                    <span>
                      Monthly income
                    </span>

                    <strong>
                      {getMonthLabel(
                        date
                      )}
                    </strong>
                  </div>

                  <span className="form-budget-percentage">
                    +
                    ৳
                    {formatMoney(
                      numericAmount
                    )}
                  </span>
                </div>

                <div className="form-budget-values">
                  <div>
                    <span>
                      Current Income
                    </span>

                    <strong className="income-value">
                      ৳
                      {formatMoney(
                        monthBudget.income
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Current Spent
                    </span>

                    <strong className="expense-value">
                      ৳
                      {formatMoney(
                        monthBudget.expense
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      New Limit
                    </span>

                    <strong>
                      ৳
                      {formatMoney(
                        monthBudget.income +
                          numericAmount
                      )}
                    </strong>
                  </div>
                </div>

                <p className="budget-help">
                  This income will
                  increase your
                  available monthly
                  spending limit to{" "}
                  <strong>
                    ৳
                    {formatMoney(
                      projectedRemaining
                    )}
                  </strong>
                  .
                </p>
              </div>


              <div className="form-field">
                <label htmlFor="incomeNotes">
                  Notes

                  <span className="optional-text">
                    Optional
                  </span>
                </label>

                <textarea
                  id="incomeNotes"
                  className="form-input"
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Additional income details..."
                />
              </div>
            </>
          )}


          {/* ======================== */}
          {/* EXPENSE FORM             */}
          {/* ======================== */}

          {formMode ===
            "Expense" && (
            <>
              <div className="form-field">
                <label htmlFor="expenseDescription">
                  Expense Description
                </label>

                <input
                  id="expenseDescription"
                  type="text"
                  className="form-input"
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. Grocery shopping"
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="expenseAmount">
                  Expense Amount
                </label>

                <input
                  id="expenseAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  value={
                    amount
                  }
                  onChange={(
                    event
                  ) => {
                    setAmount(
                      event.target
                        .value
                    );

                    setFormError(
                      ""
                    );
                  }}
                  placeholder="0.00"
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="expenseDate">
                  Date
                </label>

                <input
                  id="expenseDate"
                  type="date"
                  className="form-input"
                  value={
                    date
                  }
                  onChange={(
                    event
                  ) => {
                    setDate(
                      event.target
                        .value
                    );

                    setFormError(
                      ""
                    );
                  }}
                  required
                />
              </div>


              {/* MONTHLY LIMIT */}

              <div className="form-budget-panel">
                <div className="form-budget-title">
                  <div>
                    <span>
                      Monthly spending limit
                    </span>

                    <strong>
                      {getMonthLabel(
                        date
                      )}
                    </strong>
                  </div>

                  <span className="form-budget-percentage">
                    {Math.round(
                      usagePercentage
                    )}
                    % used
                  </span>
                </div>

                <div className="form-budget-values">
                  <div>
                    <span>
                      Income
                    </span>

                    <strong className="income-value">
                      ৳
                      {formatMoney(
                        monthBudget.income
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Spent
                    </span>

                    <strong className="expense-value">
                      ৳
                      {formatMoney(
                        monthBudget.expense
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Available
                    </span>

                    <strong>
                      ৳
                      {formatMoney(
                        safeRemaining
                      )}
                    </strong>
                  </div>
                </div>


                <div className="form-budget-progress">
                  <div
                    className="form-budget-progress-fill"
                    style={{
                      width:
                        `${usagePercentage}%`,
                    }}
                  />
                </div>


                {monthBudget.income <=
                0 ? (
                  <p className="budget-help warning">
                    Add income for
                    this month before
                    recording an
                    expense.
                  </p>
                ) : (
                  <p className="budget-help">
                    After this expense,
                    you would have{" "}
                    <strong>
                      ৳
                      {formatMoney(
                        Math.max(
                          projectedRemaining,
                          0
                        )
                      )}
                    </strong>{" "}
                    remaining.
                  </p>
                )}
              </div>


              {/* CATEGORY */}

              <div className="form-field">
                <label htmlFor="category">
                  Expense Category
                </label>

                <select
                  id="category"
                  className="form-input"
                  value={
                    category
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target
                        .value
                    )
                  }
                  required
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


              {/* PAYMENT */}

              <div className="form-field">
                <label htmlFor="paymentMethod">
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  className="form-input"
                  value={
                    paymentMethod
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentMethod(
                      event.target
                        .value
                    )
                  }
                  required
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


              {/* NOTES */}

              <div className="form-field">
                <label htmlFor="expenseNotes">
                  Notes

                  <span className="optional-text">
                    Optional
                  </span>
                </label>

                <textarea
                  id="expenseNotes"
                  className="form-input"
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Add any additional details..."
                />
              </div>
            </>
          )}


          {/* ======================== */}
          {/* ERROR                    */}
          {/* ======================== */}

          {formError && (
            <div className="limit-error">
              {formError}
            </div>
          )}


          {/* ======================== */}
          {/* SUBMIT BUTTON            */}
          {/* ======================== */}

          <button
            type="submit"
            className="button"
          >
            {formMode ===
            "Income"
              ? "+ Add Income"
              : "+ Add Expense"}
          </button>
        </form>


        {/* ========================== */}
        {/* CONFIRMATION MODAL         */}
        {/* ========================== */}

        {pendingRecord && (
          <div className="modal-overlay">
            <div className="confirm-modal">

              {confirmationStage ===
                "confirm" && (
                <>
                  <div className="confirm-icon">
                    ?
                  </div>

                  <p className="section-label">
                    CONFIRM{" "}
                    {pendingRecord.transactionType.toUpperCase()}
                  </p>

                  <h2>
                    Check the details
                  </h2>

                  <p className="confirm-description">
                    Please confirm the
                    information before
                    saving.
                  </p>


                  <div className="confirmation-details">

                    <div className="confirmation-row">
                      <span>
                        Description
                      </span>

                      <strong>
                        {
                          pendingRecord.description
                        }
                      </strong>
                    </div>


                    <div className="confirmation-row">
                      <span>
                        Type
                      </span>

                      <strong
                        className={
                          pendingRecord.transactionType ===
                          "Income"
                            ? "income-text"
                            : "expense-text"
                        }
                      >
                        {
                          pendingRecord.transactionType
                        }
                      </strong>
                    </div>


                    {pendingRecord.transactionType ===
                      "Income" && (
                      <div className="confirmation-row">
                        <span>
                          Income Type
                        </span>

                        <strong>
                          {
                            pendingRecord.incomeType
                          }
                        </strong>
                      </div>
                    )}


                    {pendingRecord.transactionType ===
                      "Expense" && (
                      <>
                        <div className="confirmation-row">
                          <span>
                            Category
                          </span>

                          <strong>
                            {
                              pendingRecord.category
                            }
                          </strong>
                        </div>

                        <div className="confirmation-row">
                          <span>
                            Payment
                          </span>

                          <strong>
                            {
                              pendingRecord.paymentMethod
                            }
                          </strong>
                        </div>
                      </>
                    )}


                    <div className="confirmation-row">
                      <span>
                        Amount
                      </span>

                      <strong>
                        ৳
                        {formatMoney(
                          pendingRecord.amount
                        )}
                      </strong>
                    </div>


                    <div className="confirmation-row">
                      <span>
                        Date
                      </span>

                      <strong>
                        {
                          pendingRecord.date
                        }
                      </strong>
                    </div>


                    {pendingRecord.transactionType ===
                      "Expense" && (
                      <div className="confirmation-row">
                        <span>
                          Remaining after
                        </span>

                        <strong className="positive-balance">
                          ৳
                          {formatMoney(
                            Math.max(
                              safeRemaining -
                                pendingRecord.amount,
                              0
                            )
                          )}
                        </strong>
                      </div>
                    )}


                    {pendingRecord.notes && (
                      <div className="confirmation-row">
                        <span>
                          Notes
                        </span>

                        <strong>
                          {
                            pendingRecord.notes
                          }
                        </strong>
                      </div>
                    )}

                  </div>


                  {saveError && (
                    <div className="save-error">
                      {saveError}
                    </div>
                  )}


                  <div className="confirmation-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={
                        closeModal
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="confirm-button"
                      onClick={
                        handleConfirm
                      }
                    >
                      Confirm & Add
                    </button>
                  </div>
                </>
              )}


              {confirmationStage ===
                "loading" && (
                <div className="confirmation-status">

                  <div className="bee-loader">
                    <div className="bee-loader-ring" />

                    <div className="bee-loader-icon">
                      🐝
                    </div>
                  </div>

                  <p className="section-label">
                    CONFIRMED
                  </p>

                  <h2>
                    Thanks for confirming!
                  </h2>

                  <p>
                    Saving your{" "}
                    {pendingRecord.transactionType.toLowerCase()}
                    ...
                  </p>

                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                </div>
              )}


              {confirmationStage ===
                "success" && (
                <div className="confirmation-status">

                  <div className="success-check">
                    ✓
                  </div>

                  <p className="section-label">
                    SUCCESS
                  </p>

                  <h2>
                    {pendingRecord.transactionType} added!
                  </h2>

                  <p>
                    Your transaction
                    has been saved
                    successfully.
                  </p>

                </div>
              )}

            </div>
          </div>
        )}
      </>
    );
  };