import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    bloodGroup: String,
    phone: String,
    hospitalName: String,
    address: String,
    active: {
      type: Boolean,
      default: true
    },
    donationCount: {
      type: Number,
      default: 0
    },
    successfulMissions: {
      type: Number,
      default: 0
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    lastDonationDate: Date
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
