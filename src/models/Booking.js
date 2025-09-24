import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    userID: {
      type: String,
      require: true,
    },
    pickupTime: { type: Date, required: true },
    estimatedStart: { type: Date, required: true },
    estimatedEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
      estimatedDurationMinutes: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ vehicle: 1, estimatedStart: 1, estimatedEnd: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
