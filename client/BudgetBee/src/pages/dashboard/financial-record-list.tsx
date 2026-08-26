import { useFinancialRecordContext } from "../../contexts/financial-record-context";

export const FinancialRecordList = () => {
  const { records, deleteRecord } = useFinancialRecordContext();

  if (records.length === 0) {
    return (
      <div className="financial-record-list">
        <h2>Financial Records</h2>
        <p>No financial records yet.</p>
      </div>
    );
  }

  return (
    <div className="financial-record-list">
      <h2>Financial Records</h2>

      <table className="records-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>
                {new Date(record.date).toLocaleDateString()}
              </td>

              <td>{record.description}</td>

              <td>{record.transactionType}</td>

              <td>{record.category}</td>

              <td>{record.paymentMethod}</td>

              <td>
                ৳{record.amount.toFixed(2)}
              </td>

              <td>
                {record.notes || "-"}
              </td>

              <td>
                <button
                  className="delete-button"
                  disabled={!record._id}
                  onClick={() => {
                    if (record._id) {
                      deleteRecord(record._id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};