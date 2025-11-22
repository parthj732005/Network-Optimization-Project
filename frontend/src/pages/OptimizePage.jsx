import React, { useState } from "react";
import { useOptimize } from "../queries/useOptimize";

export default function OptimizePage() {
  const [numCustomers, setNumCustomers] = useState("");
  const [numFcs, setNumFcs] = useState("");
  const [k, setK] = useState("");
  const [validationError, setValidationError] = useState(null);

  const { mutate, data, isLoading, error: apiError } = useOptimize();


  const handleCustomerChange = (e) => {
    setNumCustomers(e.target.value);
    if (validationError) setValidationError(null);
  };


  const validateFcEntry = () => {
    const nCust = Number(numCustomers);
    if (!numCustomers) {
      setValidationError("Please enter the Number of Customers first.");
      return false;
    }

    if (nCust < 100 || nCust > 4000) {
      setValidationError("Number of Customers must be between 100 and 4000.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleFcChange = (e) => {
    if (validateFcEntry()) setNumFcs(e.target.value);
  };


  const validateKEntry = () => {
    if (!numFcs || Number(numFcs) <= 0) {
      setValidationError("Please enter a valid Number of FC Candidates before entering k.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleKChange = (e) => {
    if (validateKEntry()) setK(e.target.value);
  };


  const onSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    const nCust = Number(numCustomers);
    const nFc = Number(numFcs);
    const nK = Number(k);


    if (!nCust) return setValidationError("Number of Customers is required.");
    if (nCust < 100 || nCust > 1000) return setValidationError("Number of Customers must be between 100 and 4000.");
    if (!nFc) return setValidationError("Number of FC Candidates is required.");
    if (!nK) return setValidationError("k (FCs to open) is required.");
    if (nK > nFc) return setValidationError(`k (${nK}) cannot be greater than FC Candidates (${nFc}).`);

    mutate({ num_customers: nCust, num_fc_candidates: nFc, k: nK });
  };

  const displayError = validationError || (apiError ? (apiError.message || String(apiError)) : null);

  return (
    <div style={{ maxWidth: 1100, margin: "28px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Fulfilment Center (FC) Network Optimization for Retail/E-Commerce</h1>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <label>
          # Customer Geolocations (ZIP Code) (100 - 4000)
          <input type="number" min="100" max="4000" placeholder="100 - 4000"
            value={numCustomers} onChange={handleCustomerChange} />
        </label>
        <label>
          # FC Candidates
          <input type="number" min="1" placeholder="Enter second..."
            value={numFcs} onChange={handleFcChange} onFocus={validateFcEntry} />
        </label>
        <label>
          k (FCs to open)
          <input type="number" min="1" placeholder="Enter third..."
            value={k} onChange={handleKChange} onFocus={validateKEntry} />
        </label>
        <div style={{ alignSelf: "flex-end" }}>
          <button type="submit" disabled={isLoading} style={{ padding: "8px 14px" }}>
            {isLoading ? "Running..." : "Run Optimization"}
          </button>
        </div>
      </form>

      {displayError && (
        <div style={{ color: "crimson", marginBottom: 12, fontWeight: "bold", border: "1px solid crimson", padding: "8px", borderRadius: "4px", background: "#fff0f0" }}>
          Error: {displayError}
        </div>
      )}

      {data && (
        <div>
          <h2>Summary</h2>
          <div><strong>Total cost:</strong> {String(data.total_cost)}</div>


          <h3>Potential FC Candidates ({data.all_fc_candidates?.length || 0})</h3>
          <div style={{ maxHeight: 260, overflow: "auto", marginBottom: 12 }}>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr><th>FC id</th><th>Latitude</th><th>Longitude</th><th>Opening cost</th></tr>
              </thead>
              <tbody>
                {data.all_fc_candidates?.map(fc => (
                  <tr key={fc.fc_id}>
                    <td>{fc.fc_id}</td>
                    <td>{fc.latitude}</td>
                    <td>{fc.longitude}</td>
                    <td>{fc.opening_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <h3>Selected FCs ({data.selected_fcs?.length || 0})</h3>
          <div style={{ maxHeight: 260, overflow: "auto", marginBottom: 12 }}>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
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
          </div>


          <h3>Customer Geolocations(first 20)</h3>
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
            <img alt="map" src={`data:image/png;base64,${data.map_base64}`}
              style={{ maxWidth: "100%", border: "1px solid #ddd", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }} />
          ) : <div>No map returned</div>}
        </div>
      )}
    </div>
  );
}

