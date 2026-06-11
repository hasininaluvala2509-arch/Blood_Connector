import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    bloodGroup: String,
    location: String,
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    neededBy: {
      type: Date,
      required: true
    },
    contactNumber: String,
    hospitalName: String,
    hospitalAddress: String,
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      default: "open"
    }
  },
  { timestamps: true }
);

requestSchema.index({ geoLocation: "2dsphere" });

const Request = mongoose.model("Request", requestSchema);

export default Request;
