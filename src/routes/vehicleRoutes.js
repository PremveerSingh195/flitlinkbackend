import express from "express";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

const router = express.Router();

function calculateRideDurationHours(fromPincode, toPincode) {
  if (!fromPincode || !toPincode) return 1; // default 1 hour
  const fromNum = parseInt(fromPincode, 10);
  const toNum = parseInt(toPincode, 10);

  if (isNaN(fromNum) || isNaN(toNum)) return 1; // fallback if invalid
  const diff = Math.abs(toNum - fromNum);
  return diff % 24;
}

router.post("/", async (req, res) => {
  try {
    const { name, capacityKg, tyres } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "name is required and must be in string" });
    }
    if (
      capacityKg == null ||
      typeof capacityKg !== "number" ||
      capacityKg <= 0
    ) {
      return res.status(400).json({
        error: "capacityKg is required and must be in positive number",
      });
    }
    if (tyres == null || typeof tyres !== "number" || tyres < 2) {
      return res
        .status(400)
        .json({ error: "tyres is required and must be a number >= 2" });
    }

    const vehicle = new Vehicle({ name, capacityKg, tyres });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/available", async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    if (!capacityRequired || !startTime) {
      return res
        .status(400)
        .json({ error: "capacityRequired and startTime required" });
    }

    const capacity = Number(capacityRequired);
    const start = new Date(startTime);
    if (isNaN(start.getTime()))
      return res.status(400).json({ error: "Invalid startTime" });

    let estimatedRideDurationHours = calculateRideDurationHours(
      fromPincode,
      toPincode
    );
    if (fromPincode && toPincode) {
      const diff = Math.abs(
        Number(fromPincode.slice(-3)) - Number(toPincode.slice(-3))
      );
      estimatedRideDurationHours = (diff % 5) + 1;
    }
    const end = new Date(
      start.getTime() + estimatedRideDurationHours * 60 * 60 * 1000
    );

    const vehicles = await Vehicle.find({
      capacityKg: { $gte: capacity },
      status: "available",
    }).lean();

    const availablevehicles = [];

    for (const v of vehicles) {
      const overlapping = await Booking.findOne({
        vehicle: v._id,
        status: { $in: ["pending", "confirmed", "in_progress"] },
        $expr: {
          $and: [
            { $lt: ["$estimatedStart", end] },
            { $lt: [start, "$estimatedEnd"] },
          ],
        },
      }).lean();

      if (!overlapping) {
        availablevehicles.push(v);
      }
    }

    res
      .status(200)
      .json({ estimatedRideDurationHours, vehicles: availablevehicles });
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
