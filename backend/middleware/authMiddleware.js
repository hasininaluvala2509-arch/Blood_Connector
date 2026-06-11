import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Using default secret for development.");
}

// 🔐 VERIFY TOKEN
export const verifyToken = (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json("JWT secret is not configured");
    }

    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json("No token");
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // { id, role }

    next();
  } catch (error) {
    return res.status(401).json("Invalid token");
  }
};

// 🔐 ROLE CHECK
export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json("Access denied");
    }
    next();
  };
};