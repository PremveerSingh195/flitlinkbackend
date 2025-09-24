import request from "supertest";
import app from "../app.js"; // your Express app
import Vehicle from "../models/Vehicle.js";

describe("POST /api/vehicles", () => {
  beforeEach(async () => {
    await Vehicle.deleteMany({});
  });

  it("should create a vehicle when valid data is provided", async () => {
    const res = await request(app).post("/api/vehicles").send({
      name: "Truck",
      capacityKg: 1000,
      tyres: 6,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Truck");
  });

  it("should return 400 when missing required fields", async () => {
    const res = await request(app).post("/api/vehicles").send({
      capacityKg: 1000,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
