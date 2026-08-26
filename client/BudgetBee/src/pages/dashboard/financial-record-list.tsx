import {
  useFinancialRecordContext,
} from "../../contexts/financial-record-context";

export const FinancialRecordList =
  () => {
    const {
      records,
      deleteRecord,
    } =
      useFinancialRecordContext();

    if (
      records.length ===
      0
    ) {
      return (
        <div className="financial-record-list">
          <h2>
            Financial Records
          </h2>

          <p>
            No financial records yet.
          </p>
        </div>
      );
    }

    return (
      <div className="financial-record-list">
        <h2>
          Financial Records
        </h2>

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
                Action
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
                      {new Date(
                        record.date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {
                        record.description
                      }
                    </td>

                    <td>
                      <span
                        className={
                          isIncome
                            ? "income-text"
                            : "expense-text"
                        }
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
                        {Number(
                          record.amount
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </td>

                    <td>
                      {record.notes ||
                        "-"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        disabled={
                          !record._id
                        }
                        onClick={() => {
                          if (
                            record._id
                          ) {
                            void deleteRecord(
                              record._id
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    );
  };