import express from "express";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

const router = express.Router();

function calculateRideDurationHours(fromPincode, toPincode) {
  if (!fromPincode || !toPincode) return 1;

  const fromNum = parseInt(fromPincode, 10);
  const toNum = parseInt(toPincode, 10);

  if (isNaN(fromNum) || isNaN(toNum)) return 1;
  const diff = Math.abs(toNum - fromNum);
  return diff % 24;
}

router.post("/", async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } =
      req.body;

    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const start = new Date(startTime);

    if (isNaN(start.getTime()))
      return res.status(400).json({ error: "Invalid startTime" });

    const estimatedRideDurationHours = calculateRideDurationHours(
      fromPincode,
      toPincode
    );
    const bookingEndTime = new Date(
      start.getTime() + estimatedRideDurationHours * 60 * 60 * 1000
    );

    const overlapping = await Booking.findOne({
      vehicle: vehicle._id,
      status: { $in: ["pending", "confirmed", "in_progress"] },
      $expr: {
        $and: [
          { $lt: ["$estimatedStart", bookingEndTime] },
          { $lt: [start, "$estimatedEnd"] },
        ],
      },
    });

    if (overlapping) {
      return res
        .status(409)
        .json({ error: "Vehicle already booked for the requested time" });
    }

    const booking = new Booking({
      vehicle: vehicle._id,
      userId: customerId,
      pickupTime: start,
      estimatedStart: start,
      estimatedEnd: bookingEndTime,
      estimatedDurationMinutes: estimatedRideDurationHours * 60,
      status: "confirmed",
    });

    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
