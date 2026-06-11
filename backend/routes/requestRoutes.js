import express from "express";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { checkRole, verifyToken } from "../middleware/authMiddleware.js";
import { sendSMS } from "../utils/sendSMS.js";

const router = express.Router();

// CREATE BLOOD REQUEST (ONLY HOSPITAL)
router.post("/", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    const {
      bloodGroup,
      location,
      lat,
      lng,
      urgency,
      contactNumber,
      hospitalName
    } = req.body;

    if (!bloodGroup || !location || lat == null || lng == null || !urgency || !contactNumber || !hospitalName) {
      return res.status(400).json("All fields are required");
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json("Latitude and longitude must be valid numbers");
    }

    const newRequest = new Request({
      bloodGroup,
      location,
      geoLocation: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      urgency,
      contactNumber,
      hospitalName,
      hospitalId: req.user.id
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// GET ALL URGENT REQUESTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// GET NEARBY ALERTS FOR DONOR
router.get("/nearby", verifyToken, checkRole("donor"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.location) {
      return res.status(400).json("Unable to determine your location");
    }

    const requests = await Request.aggregate([
      {
        $geoNear: {
          near: user.location,
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true,
          query: { status: "open" }
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    res.json(
      requests.map((request) => ({
        ...request,
        distance: (request.distance / 1000).toFixed(2) + " km"
      }))
    );
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// GET HOSPITAL DASHBOARD DATA
router.get("/hospital", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    const alerts = await Request.find({ hospitalId: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id);
    const openAlerts = alerts.filter((alert) => alert.status === "open").length;

    res.json({
      emergenciesCount: openAlerts,
      successfulMissions: user?.successfulMissions || 0,
      alerts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// GET DONORS FOR A SPECIFIC ALERT
router.get("/alert/:id/donors", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    const alert = await Request.findById(req.params.id);
    if (!alert) {
      return res.status(404).json("Alert not found");
    }

    if (alert.hospitalId.toString() !== req.user.id) {
      return res.status(403).json("Access denied");
    }

    const donors = await User.aggregate([
      {
        $geoNear: {
          near: alert.geoLocation,
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true
        }
      },
      {
        $match: {
          role: "donor",
          bloodGroup: alert.bloodGroup
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    const eligibleDonors = donors.filter((donor) => {
      if (!donor.lastDonationDate) return true;

      const diffDays =
        (new Date() - new Date(donor.lastDonationDate)) /
        (1000 * 60 * 60 * 24);

      return diffDays >= 90;
    });

    res.json(
      eligibleDonors.map((donor) => ({
        id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        phone: donor.phone,
        distance: (donor.distance / 1000).toFixed(2) + " km",
        lastDonationDate: donor.lastDonationDate
      }))
    );
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// UPDATE ALERT STATUS
router.patch("/:id/status", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["open", "completed", "dismissed"].includes(status)) {
      return res.status(400).json("Invalid status");
    }

    const alert = await Request.findById(req.params.id);
    if (!alert) {
      return res.status(404).json("Alert not found");
    }

    if (alert.hospitalId.toString() !== req.user.id) {
      return res.status(403).json("Access denied");
    }

    const previousStatus = alert.status;
    alert.status = status;
    await alert.save();

    if (previousStatus !== "completed" && status === "completed") {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { successfulMissions: 1 }
      });
    }

    res.json(alert);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// FIND DONORS BY LOCATION
router.get("/donors", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    let { bloodGroup, lat, lng } = req.query;

    if (!bloodGroup || lat == null || lng == null) {
      return res.status(400).json("bloodGroup, lat, and lng are required");
    }

    bloodGroup = decodeURIComponent(bloodGroup);

    const donors = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true
        }
      },
      {
        $match: {
          role: "donor",
          bloodGroup
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    const eligibleDonors = donors.filter((donor) => {
      if (!donor.lastDonationDate) return true;

      const diffDays =
        (new Date() - new Date(donor.lastDonationDate)) /
        (1000 * 60 * 60 * 24);

      return diffDays >= 90;
    });

    const finalDonors = eligibleDonors.map((d) => ({
      ...d,
      distance: (d.distance / 1000).toFixed(2) + " km"
    }));

    res.json(finalDonors);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// SOS ALERT (ALL ELIGIBLE DONORS WITHIN 30 KM)
router.post("/sos", verifyToken, checkRole("hospital"), async (req, res) => {
  try {
    let { bloodGroup, lat, lng } = req.body;

    if (!bloodGroup || lat == null || lng == null) {
      return res.status(400).json("bloodGroup, lat, and lng are required");
    }

    bloodGroup = decodeURIComponent(bloodGroup);

    const donors = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true
        }
      },
      {
        $match: {
          role: "donor",
          bloodGroup
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    const eligibleDonors = donors.filter((donor) => {
      if (!donor.lastDonationDate) return true;

      const diffDays =
        (new Date() - new Date(donor.lastDonationDate)) /
        (1000 * 60 * 60 * 24);

      return diffDays >= 90;
    });

    if (eligibleDonors.length === 0) {
      return res.json({ message: "No eligible donors found within 30 km.", donors: [] });
    }

    await Promise.all(
      eligibleDonors.map((donor) =>
        sendSMS(donor.phone, `?? URGENT: ${bloodGroup} blood needed near you`)
      )
    );

    res.json({
      message: "SOS alert sent to eligible donors within 30 km.",
      donors: eligibleDonors.map((donor) => ({
        id: donor._id,
        name: donor.name,
        phone: donor.phone,
        distance: (donor.distance / 1000).toFixed(2) + " km"
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

export default router;
