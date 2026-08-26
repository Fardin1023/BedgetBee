import {
  useMemo,
  useState,
} from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { useUser } from "@clerk/react";

import { useFinancialRecordContext } from "../../contexts/financial-record-context";

type ViewMode =
  | "weekly"
  | "monthly";

type DownloadState =
  | "idle"
  | "preparing"
  | "done";

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

const getMonthKey = (
  value: string
) => {
  if (
    /^\d{4}-\d{2}/.test(value)
  ) {
    return value.slice(0, 7);
  }

  const date =
    new Date(value);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
};

const getDateParts = (
  value: string
) => {
  if (
    /^\d{4}-\d{2}-\d{2}/.test(
      value
    )
  ) {
    const [
      year,
      month,
      day,
    ] = value
      .slice(0, 10)
      .split("-")
      .map(Number);

    return {
      year,
      month:
        month - 1,
      day,
    };
  }

  const date =
    new Date(value);

  return {
    year:
      date.getFullYear(),

    month:
      date.getMonth(),

    day:
      date.getDate(),
  };
};

const toLocalDate = (
  value: string
) => {
  const parts =
    getDateParts(value);

  return new Date(
    parts.year,
    parts.month,
    parts.day
  );
};

const isSameDay = (
  first: Date,
  second: Date
) => {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
};

const formatMoney = (
  amount: number
) => {
  return amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

export const FinancialSummaryChart = () => {
  const {
    records,
  } =
    useFinancialRecordContext();

  const {
    user,
  } =
    useUser();

  const [
    viewMode,
    setViewMode,
  ] =
    useState<ViewMode>(
      "weekly"
    );

  const [
    downloadState,
    setDownloadState,
  ] =
    useState<DownloadState>(
      "idle"
    );

  const now =
    new Date();

  const currentMonthKey =
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

  /*
    ==========================
    CURRENT MONTH BUDGET
    ==========================
  */

  const monthlyBudget =
    useMemo(() => {
      const monthlyRecords =
        records.filter(
          (record) =>
            getMonthKey(
              record.date
            ) ===
            currentMonthKey
        );

      const income =
        monthlyRecords
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
        monthlyRecords
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

        records:
          monthlyRecords,
      };
    }, [
      records,
      currentMonthKey,
    ]);

  const usagePercentage =
    monthlyBudget.income > 0
      ? (
          monthlyBudget.expense /
          monthlyBudget.income
        ) * 100
      : 0;

  const displayedUsage =
    Math.min(
      usagePercentage,
      100
    );

  /*
    ==========================
    LINE CHART DATA
    ==========================
  */

  const chartInformation =
    useMemo(() => {
      const today =
        new Date();

      let chartData:
        ChartDataPoint[] = [];

      let relevantRecords =
        [...records];

      /*
        WEEKLY:
        Monday through today.
      */

      if (
        viewMode === "weekly"
      ) {
        const currentDay =
          today.getDay();

        const daysSinceMonday =
          currentDay === 0
            ? 6
            : currentDay - 1;

        const monday =
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() -
              daysSinceMonday
          );

        const dayLabels = [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ];

        chartData =
          Array.from(
            {
              length:
                daysSinceMonday +
                1,
            },
            (_, index) => {
              const currentDate =
                new Date(
                  monday.getFullYear(),
                  monday.getMonth(),
                  monday.getDate() +
                    index
                );

              const dayRecords =
                records.filter(
                  (record) =>
                    isSameDay(
                      toLocalDate(
                        record.date
                      ),
                      currentDate
                    )
                );

              const income =
                dayRecords
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
                dayRecords
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
                label:
                  dayLabels[
                    index
                  ],

                income,

                expense,
              };
            }
          );

        const endOfToday =
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999
          );

        relevantRecords =
          records.filter(
            (record) => {
              const recordDate =
                toLocalDate(
                  record.date
                );

              return (
                recordDate >=
                  monday &&
                recordDate <=
                  endOfToday
              );
            }
          );
      }

      /*
        MONTHLY:
        Day 1 through today.
      */

      else {
        const year =
          today.getFullYear();

        const month =
          today.getMonth();

        const currentDayOfMonth =
          today.getDate();

        chartData =
          Array.from(
            {
              length:
                currentDayOfMonth,
            },
            (_, index) => {
              const day =
                index + 1;

              const currentDate =
                new Date(
                  year,
                  month,
                  day
                );

              const dayRecords =
                records.filter(
                  (record) =>
                    isSameDay(
                      toLocalDate(
                        record.date
                      ),
                      currentDate
                    )
                );

              const income =
                dayRecords
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
                dayRecords
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
                label:
                  String(day),

                income,

                expense,
              };
            }
          );

        relevantRecords =
          records.filter(
            (record) => {
              const recordDate =
                toLocalDate(
                  record.date
                );

              return (
                recordDate.getFullYear() ===
                  year &&
                recordDate.getMonth() ===
                  month
              );
            }
          );
      }

      const totalIncome =
        relevantRecords
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

      const totalExpense =
        relevantRecords
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
        chartData,

        totalIncome,

        totalExpense,

        balance:
          totalIncome -
          totalExpense,

        transactionCount:
          relevantRecords.length,
      };
    }, [
      records,
      viewMode,
    ]);

  /*
    ==========================
    WARNING MESSAGE
    ==========================
  */

  const getBudgetStatus = () => {
    if (
      monthlyBudget.income <=
      0
    ) {
      return {
        level:
          "warning",

        message:
          "Add your monthly income before recording expenses.",
      };
    }

    if (
      usagePercentage >= 100
    ) {
      return {
        level:
          "danger",

        message:
          "You have reached your monthly spending limit.",
      };
    }

    if (
      usagePercentage >= 90
    ) {
      return {
        level:
          "danger",

        message:
          "Warning: You have used more than 90% of your monthly income.",
      };
    }

    if (
      usagePercentage >= 80
    ) {
      return {
        level:
          "warning",

        message:
          "You are approaching your monthly spending limit.",
      };
    }

    return {
      level:
        "good",

      message:
        "Your spending is currently within your monthly income limit.",
    };
  };

  const budgetStatus =
    getBudgetStatus();

  /*
    ==========================
    DOWNLOAD MONTHLY PDF
    ==========================
  */

  const downloadMonthlyPdf =
    async () => {
      if (
        downloadState ===
        "preparing"
      ) {
        return;
      }

      setDownloadState(
        "preparing"
      );

      /*
        Give the button enough time
        to visibly enter its
        preparing state.
      */

      await new Promise<void>(
        (resolve) => {
          setTimeout(
            resolve,
            450
          );
        }
      );

      const document =
        new jsPDF({
          orientation:
            "portrait",

          unit:
            "mm",

          format:
            "a4",
        });

      const monthName =
        now.toLocaleDateString(
          "en-US",
          {
            month:
              "long",

            year:
              "numeric",
          }
        );

      const userName =
        [
          user?.firstName,
          user?.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        "Budget Bee User";

      const monthlyExpenses =
        monthlyBudget.records
          .filter(
            (record) =>
              record.transactionType ===
              "Expense"
          )
          .sort(
            (
              first,
              second
            ) =>
              toLocalDate(
                first.date
              ).getTime() -
              toLocalDate(
                second.date
              ).getTime()
          );

      /*
        PDF HEADER
      */

      document.setFont(
        "helvetica",
        "bold"
      );

      document.setFontSize(
        21
      );

      document.text(
        "Budget Bee",
        14,
        18
      );

      document.setFontSize(
        15
      );

      document.text(
        "Monthly Expenditure Report",
        14,
        28
      );

      document.setFont(
        "helvetica",
        "normal"
      );

      document.setFontSize(
        10
      );

      document.text(
        `Period: ${monthName}`,
        14,
        36
      );

      document.text(
        `User: ${userName}`,
        14,
        42
      );

      document.text(
        `Generated: ${new Date().toLocaleString(
          "en-US"
        )}`,
        14,
        48
      );

      /*
        SUMMARY
      */

      document.setDrawColor(
        220,
        220,
        220
      );

      document.line(
        14,
        54,
        196,
        54
      );

      document.setFont(
        "helvetica",
        "bold"
      );

      document.setFontSize(
        11
      );

      document.text(
        "Monthly Summary",
        14,
        63
      );

      document.setFont(
        "helvetica",
        "normal"
      );

      document.text(
        `Total Income: BDT ${formatMoney(
          monthlyBudget.income
        )}`,
        14,
        72
      );

      document.text(
        `Total Expense: BDT ${formatMoney(
          monthlyBudget.expense
        )}`,
        14,
        79
      );

      document.text(
        `Remaining Balance: BDT ${formatMoney(
          monthlyBudget.remaining
        )}`,
        14,
        86
      );

      document.text(
        `Income Used: ${usagePercentage.toFixed(
          1
        )}%`,
        14,
        93
      );

      /*
        EXPENSE TABLE
      */

      const rows =
        monthlyExpenses.length >
        0
          ? monthlyExpenses.map(
              (record) => [
                toLocalDate(
                  record.date
                ).toLocaleDateString(
                  "en-GB"
                ),

                record.description,

                record.category,

                record.paymentMethod,

                `BDT ${formatMoney(
                  Number(
                    record.amount
                  )
                )}`,

                record.notes ||
                  "-",
              ]
            )
          : [
              [
                "-",
                "No expense transactions recorded this month.",
                "-",
                "-",
                "BDT 0.00",
                "-",
              ],
            ];

      autoTable(
        document,
        {
          startY:
            102,

          head: [
            [
              "Date",
              "Description",
              "Category",
              "Payment",
              "Amount",
              "Notes",
            ],
          ],

          body:
            rows,

          foot: [
            [
              "",
              "",
              "",
              "Total Expense",
              `BDT ${formatMoney(
                monthlyBudget.expense
              )}`,
              "",
            ],
          ],

          styles: {
            font:
              "helvetica",

            fontSize:
              8,

            cellPadding:
              2.5,

            overflow:
              "linebreak",
          },

          headStyles: {
            fillColor: [
              244,
              180,
              0,
            ],

            textColor: [
              20,
              20,
              20,
            ],

            fontStyle:
              "bold",
          },

          footStyles: {
            fillColor: [
              245,
              245,
              245,
            ],

            textColor: [
              20,
              20,
              20,
            ],

            fontStyle:
              "bold",
          },

          columnStyles: {
            0: {
              cellWidth:
                21,
            },

            1: {
              cellWidth:
                42,
            },

            2: {
              cellWidth:
                27,
            },

            3: {
              cellWidth:
                28,
            },

            4: {
              cellWidth:
                28,
            },

            5: {
              cellWidth:
                36,
            },
          },

          margin: {
            left:
              14,

            right:
              14,
          },

          didDrawPage: (
            data
          ) => {
            const pageHeight =
              document.internal
                .pageSize
                .getHeight();

            document.setFontSize(
              8
            );

            document.setTextColor(
              120,
              120,
              120
            );

            document.text(
              `Budget Bee | ${monthName} | Page ${data.pageNumber}`,
              14,
              pageHeight - 8
            );
          },
        }
      );

      /*
        SAVE

        We use BDT instead of the
        Taka Unicode symbol inside
        the PDF because the default
        PDF font may not contain the
        Taka glyph.
      */

      const safeMonth =
        monthName
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          );

      document.save(
        `budget-bee-${safeMonth}-expenditure.pdf`
      );

      setDownloadState(
        "done"
      );

      setTimeout(
        () => {
          setDownloadState(
            "idle"
          );
        },
        1600
      );
    };

  return (
    <div className="summary-chart-card">
      {/* MONTHLY LIMIT */}

      <div className="budget-overview">
        <div className="budget-overview-heading">
          <div>
            <p className="section-label">
              MONTHLY LIMIT
            </p>

            <h2>
              Spending Overview
            </h2>
          </div>

          <div className="budget-percentage">
            {usagePercentage.toFixed(
              0
            )}
            %
          </div>
        </div>

        <div className="budget-stat-grid">
          <div className="budget-stat">
            <span>
              Income Limit
            </span>

            <strong className="income-value">
              ৳
              {formatMoney(
                monthlyBudget.income
              )}
            </strong>
          </div>

          <div className="budget-stat">
            <span>
              Spent
            </span>

            <strong className="expense-value">
              ৳
              {formatMoney(
                monthlyBudget.expense
              )}
            </strong>
          </div>

          <div className="budget-stat">
            <span>
              Remaining
            </span>

            <strong
              className={
                monthlyBudget.remaining >=
                0
                  ? "positive-balance"
                  : "negative-balance"
              }
            >
              ৳
              {formatMoney(
                Math.max(
                  monthlyBudget.remaining,
                  0
                )
              )}
            </strong>
          </div>
        </div>

        <div className="budget-progress-heading">
          <span>
            Monthly income used
          </span>

          <strong>
            {usagePercentage.toFixed(
              1
            )}
            %
          </strong>
        </div>

        <div className="budget-progress-track">
          <div
            className={`budget-progress-fill ${
              usagePercentage >=
              90
                ? "danger"
                : usagePercentage >=
                    80
                  ? "warning"
                  : "good"
            }`}
            style={{
              width:
                `${displayedUsage}%`,
            }}
          />
        </div>

        <div
          className={`budget-status ${budgetStatus.level}`}
        >
          <span className="budget-status-dot" />

          {
            budgetStatus.message
          }
        </div>
      </div>

      <div className="chart-section-divider" />

      {/* CHART HEADER */}

      <div className="summary-chart-header">
        <div>
          <p className="section-label">
            FINANCIAL TREND
          </p>

          <h2>
            Income & Expense
          </h2>
        </div>

        <div className="chart-icon">
          ↗
        </div>
      </div>

      {/* WEEKLY / MONTHLY */}

      <div className="chart-tabs">
        <button
          type="button"
          className={`chart-tab ${
            viewMode === "weekly"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setViewMode(
              "weekly"
            )
          }
        >
          Weekly
        </button>

        <button
          type="button"
          className={`chart-tab ${
            viewMode === "monthly"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setViewMode(
              "monthly"
            )
          }
        >
          Monthly
        </button>
      </div>

      <div className="chart-total-grid">
        <div className="chart-total-item">
          <span>
            {viewMode ===
            "weekly"
              ? "Weekly Income"
              : "Monthly Income"}
          </span>

          <strong className="income-value">
            ৳
            {formatMoney(
              chartInformation.totalIncome
            )}
          </strong>
        </div>

        <div className="chart-total-item">
          <span>
            {viewMode ===
            "weekly"
              ? "Weekly Expense"
              : "Monthly Expense"}
          </span>

          <strong className="expense-value">
            ৳
            {formatMoney(
              chartInformation.totalExpense
            )}
          </strong>
        </div>
      </div>

      {/* LINE GRAPH */}

      <div className="line-chart-container">
        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart
            data={
              chartInformation.chartData
            }
            margin={{
              top:
                10,

              right:
                20,

              left:
                5,

              bottom:
                5,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(148, 163, 184, 0.16)"
            />

            <XAxis
              dataKey="label"
              tick={{
                fill:
                  "var(--text-secondary)",

                fontSize:
                  11,
              }}
              axisLine={
                false
              }
              tickLine={
                false
              }
            />

            <YAxis
              tick={{
                fill:
                  "var(--text-secondary)",

                fontSize:
                  11,
              }}
              axisLine={
                false
              }
              tickLine={
                false
              }
              tickFormatter={(
                value
              ) =>
                `৳${Number(
                  value
                ).toLocaleString()}`
              }
            />

            <Tooltip
              formatter={(
                value,
                name
              ) => [
                `৳${Number(
                  value ?? 0
                ).toLocaleString()}`,

                String(
                  name
                ),
              ]}
              contentStyle={{
                borderRadius:
                  "12px",

                border:
                  "1px solid var(--border)",

                background:
                  "var(--card-bg-solid)",

                color:
                  "var(--text-main)",
              }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{
                r:
                  4,

                fill:
                  "#22c55e",
              }}
              activeDot={{
                r:
                  7,
              }}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{
                r:
                  4,

                fill:
                  "#ef4444",
              }}
              activeDot={{
                r:
                  7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SUMMARY */}

      <div className="chart-summary">
        <div>
          <span>
            Balance
          </span>

          <strong
            className={
              chartInformation.balance >=
              0
                ? "positive-balance"
                : "negative-balance"
            }
          >
            {chartInformation.balance >=
            0
              ? "+"
              : "-"}
            ৳
            {formatMoney(
              Math.abs(
                chartInformation.balance
              )
            )}
          </strong>
        </div>

        <div>
          <span>
            Transactions
          </span>

          <strong>
            {
              chartInformation.transactionCount
            }
          </strong>
        </div>
      </div>

      {/* PDF DOWNLOAD */}

      <div className="report-download-section">
        <div>
          <span className="report-download-title">
            Monthly expenditure
            report
          </span>

          <p>
            Download your current
            month's expense history
            and summary as a PDF.
          </p>
        </div>

        <button
          type="button"
          className={`pdf-download-button ${downloadState}`}
          onClick={
            downloadMonthlyPdf
          }
          disabled={
            downloadState ===
            "preparing"
          }
        >
          {downloadState ===
            "idle" && (
            <>
              <span className="download-icon">
                ↓
              </span>

              Download PDF
            </>
          )}

          {downloadState ===
            "preparing" && (
            <>
              <span className="download-spinner" />

              Preparing PDF...
            </>
          )}

          {downloadState ===
            "done" && (
            <>
              <span>
                ✓
              </span>

              Downloaded
            </>
          )}
        </button>
      </div>
    </div>
  );
};