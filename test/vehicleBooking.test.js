import request from "supertest";
import app from "../app.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

describe("POST /api/bookings", () => {
  let vehicle;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    vehicle = await Vehicle.create({
      name: "Tata Ace",
      capacityKg: 700,
      tyres: 4,
    });
  });

  it("should create a booking when vehicle is available", async () => {
    const startTime = new Date().toISOString();

    const res = await request(app).post("/api/bookings").send({
      vehicleId: vehicle._id.toString(),
      fromPincode: "110001",
      toPincode: "110020",
      startTime,
      customerId: "cust123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.vehicle).toBe(vehicle._id.toString());
  });

  it("should return 409 if booking overlaps", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await Booking.create({
      vehicle: vehicle._id,
      userId: "custX",
      estimatedStart: start,
      estimatedEnd: end,
      status: "confirmed",
    });

    const res = await request(app).post("/api/bookings").send({
      vehicleId: vehicle._id.toString(),
      fromPincode: "110001",
      toPincode: "110020",
      startTime: start.toISOString(),
      customerId: "cust123",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});
