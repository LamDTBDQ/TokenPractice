const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Load members data from JSON file
const loadMembersData = () => {
  try {
    const membersPath = path.join(__dirname, "../data/members.json");
    const data = fs.readFileSync(membersPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading members data:", error);
    return [];
  }
};

// POST /auth/tokens - Generate JWT token
const generateToken = (req, res) => {
  const { name, pass } = req.body;

  // Validate input
  if (!name || !pass) {
    return res.status(400).json({
      success: false,
      message: "Please provide name and password",
    });
  }

  // Load members data
  const members = loadMembersData();

  // Find member with matching credentials
  const member = members.find((m) => m.name === name && m.pass === pass);

  if (!member) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Create JWT payload
  const payload = {
    id: member.id || member._id,
    name: member.name,
  };

  // Sign token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(200).json({
    success: true,
    token: token,
  });
};

module.exports = {
  generateToken,
};
