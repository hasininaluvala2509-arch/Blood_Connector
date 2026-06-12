import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Using default secret for development.");
}

const formatLocation = (location) => {
  if (!location) return undefined;

  if (Array.isArray(location) && location.length === 2) {
    const lng = Number(location[0]);
    const lat = Number(location[1]);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return undefined;
    return {
      type: "Point",
      coordinates: [lng, lat]
    };
  }

  if (typeof location === "object" && location !== null) {
    if (location.type === "Point" && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      const lng = Number(location.coordinates[0]);
      const lat = Number(location.coordinates[1]);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return undefined;
      return {
        type: "Point",
        coordinates: [lng, lat]
      };
    }

    const { lat, lng } = location;
    if (lat != null && lng != null) {
      const lngNum = Number(lng);
      const latNum = Number(lat);
      if (Number.isNaN(lngNum) || Number.isNaN(latNum)) return undefined;
      return {
        type: "Point",
        coordinates: [lngNum, latNum]
      };
    }
  }

  if (typeof location === "string") {
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length === 2) {
      return {
        type: "Point",
        coordinates: [Number(parts[1]), Number(parts[0])]
      };
    }
  }

  return undefined;
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      bloodGroup,
      location,
      phone,
      lastDonationDate,
      hospitalName,
      address
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json("Required fields missing");
    }

    if (role !== "donor" && role !== "hospital") {
      return res.status(400).json("Invalid role");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    const formattedLocation = formatLocation(location);

    if (!formattedLocation || !phone) {
      return res.status(400).json("Registration requires a valid location and phone number");
    }

    if (role === "donor" && !bloodGroup) {
      return res.status(400).json("Donor registration requires bloodGroup");
    }

    if (role === "hospital" && !hospitalName) {
      return res.status(400).json("Hospital registration requires hospitalName");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      bloodGroup: role === "donor" ? bloodGroup : undefined,
      hospitalName: role === "hospital" ? hospitalName : undefined,
      address: role === "hospital" ? address : undefined,
      location: formattedLocation,
      phone,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
      donationCount: lastDonationDate ? 1 : 0,
      successfulMissions: 0
    });

    await user.save();

    res.status(201).json("User registered successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        hospitalName: user.hospitalName
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json("User not found");
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bloodGroup: user.bloodGroup,
      hospitalName: user.hospitalName,
      address: user.address,
      phone: user.phone,
      lastDonationDate: user.lastDonationDate,
      donationCount: user.donationCount,
      successfulMissions: user.successfulMissions,
      location: user.location
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// GET ACTIVE DONORS COUNT
router.get("/active-donors-count", verifyToken, async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "donor", active: true });
    res.json({ count });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const {
      name,
      phone,
      bloodGroup,
      lastDonationDate,
      hospitalName,
      address,
      location
    } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (user.role === "donor") {
      if (bloodGroup) user.bloodGroup = bloodGroup;
      if (lastDonationDate) user.lastDonationDate = new Date(lastDonationDate);
    }
    if (user.role === "hospital") {
      if (hospitalName) user.hospitalName = hospitalName;
      if (address) user.address = address;
    }
    let wasWithoutDonationDate = !user.lastDonationDate;

    if (location) {
      const formattedLocation = formatLocation(location);
      if (formattedLocation) {
        user.location = formattedLocation;
      }
    }

    if (user.role === "donor" && lastDonationDate) {
      const newDate = new Date(lastDonationDate);
      if (!user.lastDonationDate) {
        user.donationCount = (user.donationCount || 0) + 1;
      }
      user.lastDonationDate = newDate;
    }

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

export default router;
