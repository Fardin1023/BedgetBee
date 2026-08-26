/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useUser,
} from "@clerk/react";

export interface FinancialRecord {
  _id?: string;

  userID?: string;

  description: string;

  amount: number;

  transactionType:
    | "Income"
    | "Expense";

  date: string;

  /*
    Expense-only fields
  */
  category?: string;

  paymentMethod?: string;

  /*
    Income-only field
  */
  incomeType?: string;

  /*
    Optional for both
  */
  notes?: string;
}

interface FinancialRecordContextType {
  records:
    FinancialRecord[];

  addRecord: (
    record: Omit<
      FinancialRecord,
      "_id" | "userID"
    >
  ) => Promise<boolean>;

  updateRecord: (
    id: string,
    updatedRecord: Omit<
      FinancialRecord,
      "_id" | "userID"
    >
  ) => Promise<void>;

  deleteRecord: (
    id: string
  ) => Promise<void>;
}

export const FinancialRecordContext =
  createContext<
    FinancialRecordContextType
    | undefined
  >(undefined);

export const FinancialRecordProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [
    records,
    setRecords,
  ] =
    useState<
      FinancialRecord[]
    >([]);

  const {
    isLoaded,
    isSignedIn,
    user,
  } =
    useUser();

  const userId =
    isLoaded &&
    isSignedIn
      ? user.id
      : undefined;

  /*
    ==========================
    FETCH ALL USER RECORDS
    ==========================
  */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchRecords =
      async () => {
        try {
          const response =
            await fetch(
              `http://localhost:3001/financial-records/getAllByUserID/${userId}`
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to fetch financial records"
            );
          }

          const data:
            FinancialRecord[] =
            await response.json();

          setRecords(
            data
          );
        } catch (
          error
        ) {
          console.error(
            "Error fetching records:",
            error
          );
        }
      };

    void fetchRecords();
  }, [
    userId,
  ]);

  /*
    ==========================
    ADD RECORD
    ==========================
  */

  const addRecord =
    async (
      record: Omit<
        FinancialRecord,
        "_id" | "userID"
      >
    ): Promise<boolean> => {
      if (!userId) {
        return false;
      }

      try {
        const response =
          await fetch(
            "http://localhost:3001/financial-records/create",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  ...record,

                  userID:
                    userId,
                }),
            }
          );

        if (
          !response.ok
        ) {
          const errorData =
            await response
              .json()
              .catch(
                () => null
              );

          console.error(
            "Add record failed:",
            errorData
          );

          return false;
        }

        const newRecord:
          FinancialRecord =
          await response.json();

        setRecords(
          (
            previousRecords
          ) => [
            ...previousRecords,
            newRecord,
          ]
        );

        return true;
      } catch (
        error
      ) {
        console.error(
          "Error adding record:",
          error
        );

        return false;
      }
    };

  /*
    ==========================
    UPDATE RECORD
    ==========================
  */

  const updateRecord =
    async (
      id: string,

      updatedRecord: Omit<
        FinancialRecord,
        "_id" | "userID"
      >
    ) => {
      if (!userId) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:3001/financial-records/update/${id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  ...updatedRecord,

                  userID:
                    userId,
                }),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Failed to update record"
          );
        }

        const updated:
          FinancialRecord =
          await response.json();

        setRecords(
          (
            previousRecords
          ) =>
            previousRecords.map(
              (
                record
              ) =>
                record._id ===
                id
                  ? updated
                  : record
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Error updating record:",
          error
        );
      }
    };

  /*
    ==========================
    DELETE RECORD
    ==========================
  */

  const deleteRecord =
    async (
      id: string
    ) => {
      try {
        const response =
          await fetch(
            `http://localhost:3001/financial-records/delete/${id}`,
            {
              method:
                "DELETE",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Failed to delete record"
          );
        }

        setRecords(
          (
            previousRecords
          ) =>
            previousRecords.filter(
              (
                record
              ) =>
                record._id !==
                id
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Error deleting record:",
          error
        );
      }
    };

  return (
    <FinancialRecordContext.Provider
      value={{
        records,
        addRecord,
        updateRecord,
        deleteRecord,
      }}
    >
      {children}
    </FinancialRecordContext.Provider>
  );
};

export const useFinancialRecordContext =
  () => {
    const context =
      useContext(
        FinancialRecordContext
      );

    if (!context) {
      throw new Error(
        "useFinancialRecordContext must be used within a FinancialRecordProvider"
      );
    }

    return context;
  };