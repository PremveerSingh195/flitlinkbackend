import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  capacityKg: {
    type: Number,
    required: true,
    min: 1,
  },
  tyres: {
    type: Number,
    required: true,
    min: 2,
  },
  status: {
    type: String,
    enum: ["available", "reserved", "in_ride", "maintenance"],
    default: "available",
  },
  fromPincode: {
    type: String,
  },
  toPincode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
