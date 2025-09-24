import request from "supertest";
import app from "../app.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

describe("GET /api/vehicles/available", () => {
  let vehicle;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    vehicle = await Vehicle.create({
      name: "Mini Truck",
      capacityKg: 500,
      tyres: 4,
    });
  });

  it("should return available vehicles when no bookings overlap", async () => {
    const res = await request(app).get("/api/vehicles/available").query({
      capacityRequired: 200,
      fromPincode: "110001",
      toPincode: "110010",
      startTime: new Date().toISOString(),
    });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Mini Truck");
  });

  it("should exclude vehicles that have overlapping bookings", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await Booking.create({
      vehicle: vehicle._id,
      userId: "testUser",
      estimatedStart: start,
      estimatedEnd: end,
      status: "confirmed",
    });

    const res = await request(app).get("/api/vehicles/available").query({
      capacityRequired: 200,
      fromPincode: "110001",
      toPincode: "110010",
      startTime: start.toISOString(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
