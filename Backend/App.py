from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
import pulp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import base64
from io import BytesIO

# -------------------------------
# FASTAPI APP
# -------------------------------
app = FastAPI(title="FC Optimization API")


# -------------------------------
# USER INPUT MODEL
# -------------------------------
class FCRequest(BaseModel):
    num_customers: int
    num_fc_candidates: int
    k: int  # number of FCs to open


# -------------------------------
# LOAD ZIP DATA ONCE
# -------------------------------
df = pd.read_csv("US Zip Codes from 2013 Government Data_1.csv")
df = df.dropna(subset=["LAT", "LNG"])


# -------------------------------
# HELPER: RUN OPTIMIZATION
# -------------------------------
def run_model(num_customers, num_fc, k):

    # sample customers
    cust_sample = df.sample(num_customers, random_state=23)
    cust_lats = cust_sample["LAT"].values
    cust_lons = cust_sample["LNG"].values
    customers = np.column_stack((cust_lats, cust_lons))

    # sample FC candidate locations
    fc_sample = df.sample(num_fc, random_state=99)
    fc_lats = fc_sample["LAT"].values
    fc_lons = fc_sample["LNG"].values
    fc_locations = np.column_stack((fc_lats, fc_lons))

    # random opening cost for each FC
    opening_cost = np.random.randint(50000, 150000, num_fc)

    # random customer demand
    demand = np.random.randint(10, 100, num_customers)

    # compute distance and cost matrix
    dist_matrix = cdist(customers, fc_locations)
    cost_matrix = dist_matrix * demand.reshape(-1, 1)

    # LP Model
    model = pulp.LpProblem("FC_Optimization", pulp.LpMinimize)

    # decision vars
    x = pulp.LpVariable.dicts("Assign",
                              (range(num_customers), range(num_fc)),
                              0, 1, pulp.LpBinary)
    y = pulp.LpVariable.dicts("OpenFC",
                              range(num_fc), 0, 1, pulp.LpBinary)

    # objective = transport cost + opening cost
    model += (
        pulp.lpSum(cost_matrix[i][j] * x[i][j]
                   for i in range(num_customers)
                   for j in range(num_fc))
        +
        pulp.lpSum(opening_cost[j] * y[j] for j in range(num_fc))
    )

    # constraints
    model += pulp.lpSum(y[j] for j in range(num_fc)) == k

    for i in range(num_customers):
        model += pulp.lpSum(x[i][j] for j in range(num_fc)) == 1

    for i in range(num_customers):
        for j in range(num_fc):
            model += x[i][j] <= y[j]

    total_demand = demand.sum()
    max_load = 0.5 * total_demand

    for j in range(num_fc):
        model += pulp.lpSum(demand[i] * x[i][j] for i in range(num_customers)) <= max_load

    # solve
    model.solve(pulp.PULP_CBC_CMD(msg=False))

    # selected FCs
    chosen_fc = [j for j in range(num_fc) if pulp.value(y[j]) == 1]

    # assignments
    assignments = {}
    for i in range(num_customers):
        for j in chosen_fc:
            if pulp.value(x[i][j]) == 1:
                assignments[i] = j

    # total cost
    total_cost = pulp.value(model.objective)

    # generate map
    fig = plt.figure(figsize=(12, 8))
    ax = plt.axes(projection=ccrs.PlateCarree())
    ax.set_extent([-125, -66, 24, 50])
    ax.add_feature(cfeature.STATES, linewidth=0.5)
    ax.add_feature(cfeature.COASTLINE)
    ax.add_feature(cfeature.BORDERS)

    plt.scatter(cust_lons, cust_lats, color="blue", s=18)
    plt.scatter(fc_lons, fc_lats, color="gray", s=80, marker="^")
    plt.scatter(fc_lons[chosen_fc], fc_lats[chosen_fc],
                color="red", s=150, marker="^", edgecolor="black")

    for cust, fc in assignments.items():
        plt.plot([cust_lons[cust], fc_lons[fc]],
                 [cust_lats[cust], fc_lats[fc]],
                 linewidth=0.3, alpha=0.3, color="green")

    plt.title("Optimal Facility Locations")

    # save plot to base64
    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode()

    plt.close()

    # return everything
    return {
        "total_cost": total_cost,
        "selected_fcs": [
            {
                "fc_id": j,
                "latitude": float(fc_lats[j]),
                "longitude": float(fc_lons[j]),
                "opening_cost": int(opening_cost[j])
            }
            for j in chosen_fc
        ],
        "customers": [
            {
                "cust_id": i,
                "latitude": float(cust_lats[i]),
                "longitude": float(cust_lons[i]),
                "assigned_fc": assignments[i]
            }
            for i in range(num_customers)
        ],
        "map_base64": img_base64
    }


# -------------------------------
# API ENDPOINT
# -------------------------------
@app.post("/optimize_fc")
def optimize_fc(request: FCRequest):
    result = run_model(
        request.num_customers,
        request.num_fc_candidates,
        request.k
    )
    return result
