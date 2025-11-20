

import axios from "axios";

let MODEL_BASE = import.meta?.env?.VITE_MODEL_BASE;
// Case 1: Explicit "/" means "Use Same Origin" (Relative paths)
if (MODEL_BASE === "/") {

  MODEL_BASE = undefined;
}

// Case 2: Fallback if nothing defined
// In Dev mode (vite dev server), default to localhost:5000.
// In Prod (built and served via nginx), default to undefined (relative).
if (!MODEL_BASE) {

  MODEL_BASE = import.meta?.env?.DEV ? "http://localhost:5000" : undefined;
}
export { MODEL_BASE };
// Create axios client
export const modelClient = axios.create({

  baseURL: MODEL_BASE ?? undefined, 
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

function safeStringify(x) {

  try {

    if (typeof x === "string") return x;
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

function extractError(err) {

  if (!err) return "Unknown error";
    const resp = err.response;
  if (resp?.data) {

    const detail = resp.data.detail ?? resp.data;
    return safeStringify(detail);
  }

  if (err.message) return err.message;
  
  return String(err);
}

export async function optimizeFC(payload) {

  if (!payload || typeof payload !== "object") {

    throw new Error("optimizeFC requires a payload object: { num_customers, num_fc_candidates, k }");
  }

  try {

    const resp = await modelClient.post("/optimize", payload);
    return resp.data;
  } catch (err) {

    throw new Error(extractError(err));
  }
}

