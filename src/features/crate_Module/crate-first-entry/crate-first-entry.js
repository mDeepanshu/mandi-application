import React, { useState } from "react";
import EditDialog from "./dialog/crate-first-edit-dialog";
import styles from "./crate-first-entry.module.css";
import { Edit } from '@mui/icons-material';

const initialData = [
  { id: 1, vyapari: "Sharma Traders", cratesArr: [{ type: "Plastic", count: 50 },{ type: "Wooden", count: 40 }], total: 50 },
  { id: 2, vyapari: "Gupta & Sons", cratesArr: [{ type: "Wooden", count: 40 }], total: 40 },
];

export default function CrateManagement() {
  const [data, setData] = useState(initialData);
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.container}>
      <h2>Summary After Mandi Completion</h2>

      <hr/>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vyapari Name</th>
            <th>Crate Type</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.vyapari}</td>
              <td>{row.cratesArr.map((crate) => `${crate.type} (${crate.count})`).join(", ")}</td>
              <td>{row.total}</td>
              <td>
                <button className={styles.editBtn}onClick={() => setSelected(row)}>
                  <Edit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <EditDialog
          data={selected}
          onClose={() => setSelected(null)}
          onSave={(updated) => {
            setData((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}