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

  category?: string;

  paymentMethod?: string;

  incomeType?: string;

  notes?: string;
}

interface FinancialRecordContextType {
  records: FinancialRecord[];

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
  ) => Promise<boolean>;

  deleteRecord: (
    id: string
  ) => Promise<boolean>;
}

/* ======================================== */
/* API URL                                  */
/* ======================================== */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

console.log(
  "BudgetBee API:",
  API_URL
);

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

  /* ====================================== */
  /* FETCH RECORDS                          */
  /* ====================================== */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchRecords =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/financial-records/getAllByUserID/${userId}`
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch financial records."
            );
          }

          const data =
            (await response.json()) as FinancialRecord[];

          setRecords(
            data
          );
        } catch (
          error
        ) {
          console.error(
            "FETCH RECORDS ERROR:",
            error
          );
        }
      };

    void fetchRecords();
  }, [userId]);

  /* ====================================== */
  /* ADD RECORD                             */
  /* ====================================== */

  const addRecord =
    async (
      record: Omit<
        FinancialRecord,
        "_id" | "userID"
      >
    ): Promise<boolean> => {
      if (!userId) {
        console.error(
          "ADD ERROR: Clerk user ID is missing."
        );

        return false;
      }

      try {
        const payload = {
          ...record,

          userID:
            userId,
        };

        console.log(
          "ADD RECORD PAYLOAD:",
          payload
        );

        const response =
          await fetch(
            `${API_URL}/financial-records/create`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        console.log(
          "ADD STATUS:",
          response.status
        );

        console.log(
          "ADD RESPONSE:",
          data
        );

        if (!response.ok) {
          console.error(
            "ADD RECORD FAILED:",
            data
          );

          return false;
        }

        const newRecord =
          data as FinancialRecord;

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
          "ADD RECORD ERROR:",
          error
        );

        return false;
      }
    };

  /* ====================================== */
  /* UPDATE RECORD                          */
  /* ====================================== */

  const updateRecord =
    async (
      id: string,

      updatedRecord: Omit<
        FinancialRecord,
        "_id" | "userID"
      >
    ): Promise<boolean> => {
      if (!userId) {
        console.error(
          "UPDATE ERROR: Clerk user ID is missing."
        );

        return false;
      }

      try {
        const payload = {
          ...updatedRecord,

          userID:
            userId,
        };

        const response =
          await fetch(
            `${API_URL}/financial-records/update/${id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        if (!response.ok) {
          console.error(
            "UPDATE RECORD FAILED:",
            data
          );

          return false;
        }

        const updated =
          data as FinancialRecord;

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

        return true;
      } catch (
        error
      ) {
        console.error(
          "UPDATE RECORD ERROR:",
          error
        );

        return false;
      }
    };

  /* ====================================== */
  /* DELETE RECORD                          */
  /* ====================================== */

  const deleteRecord =
    async (
      id: string
    ): Promise<boolean> => {
      try {
        const response =
          await fetch(
            `${API_URL}/financial-records/delete/${id}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        if (!response.ok) {
          console.error(
            "DELETE RECORD FAILED:",
            data
          );

          return false;
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

        return true;
      } catch (
        error
      ) {
        console.error(
          "DELETE RECORD ERROR:",
          error
        );

        return false;
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