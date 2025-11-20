import React, { useState } from "react";
import { useOptimize } from "../queries/useOptimize";

export default function OptimizePage() {
  const [numCustomers, setNumCustomers] = useState(50);
  const [numFcs, setNumFcs] = useState(20);
  const [k, setK] = useState(3);
  const { mutate, data, isLoading, error } = useOptimize();

  const onSubmit = (e) => {
    e.preventDefault();
    mutate({ num_customers: Number(numCustomers), num_fc_candidates: Number(numFcs), k: Number(k) });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "28px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Facility Location — Optimize</h1>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <label>
          # Customers
          <input type="number" min="1" value={numCustomers} onChange={(e)=>setNumCustomers(e.target.value)} />
        </label>

        <label>
          # FC Candidates
          <input type="number" min="1" value={numFcs} onChange={(e)=>setNumFcs(e.target.value)} />
        </label>

        <label>
          k (FCs to open)
          <input type="number" min="1" value={k} onChange={(e)=>setK(e.target.value)} />
        </label>

        <div style={{ alignSelf: "flex-end" }}>
          <button type="submit" disabled={isLoading} style={{ padding: "8px 14px" }}>
            {isLoading ? "Running..." : "Run Optimization"}
          </button>
        </div>
      </form>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {error.message || String(error)}</div>}

      {data && (
        <div>
          <h2>Summary</h2>
          <div><strong>Total cost:</strong> {String(data.total_cost)}</div>

          <h3>Selected FCs ({data.selected_fcs?.length || 0})</h3>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginBottom: 12 }}>
            <thead>
              <tr><th>FC id</th><th>Latitude</th><th>Longitude</th><th>Opening cost</th></tr>
            </thead>
            <tbody>
              {data.selected_fcs?.map(fc => (
                <tr key={fc.fc_id}>
                  <td>{fc.fc_id}</td>
                  <td>{fc.latitude}</td>
                  <td>{fc.longitude}</td>
                  <td>{fc.opening_cost}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Customers (first 20)</h3>
          <div style={{ maxHeight: 260, overflow: "auto", marginBottom: 12 }}>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr><th>cust_id</th><th>lat</th><th>lon</th><th>assigned_fc</th></tr>
              </thead>
              <tbody>
                {data.customers?.slice(0, 20).map(c => (
                  <tr key={c.cust_id}>
                    <td>{c.cust_id}</td>
                    <td>{c.latitude}</td>
                    <td>{c.longitude}</td>
                    <td>{c.assigned_fc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Map</h3>
          {data.map_base64 ? (
            <img alt="map" src={`data:image/png;base64,${data.map_base64}`} style={{ maxWidth: "100%", border: "1px solid #ddd", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }} />
          ) : <div>No map returned</div>}
        </div>
      )}
    </div>
  );
}
