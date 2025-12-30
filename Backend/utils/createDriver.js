require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Driver = require("../models/driver");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

async function createDriver() {
  try {
    const driverData = [
      {
        email: "driver1@example.com",
        password: "driver123",
        name: "John",
        licenseNumber: "DL123456789",
        licenseExpiry: new Date("2028-12-31"),
        vehicleType: "sedan",
        vehicleNumber: "ABC1234",
        vehicleModel: "Toyota Camry",
        phoneNumber: "999999999",
        rating: 5,
        isVerified: true,
        isActive: true,
      },
      {
        email: "driver2@example.com",
        password: "driver456",
        name: "Sarah",
        licenseNumber: "DL987654321",
        licenseExpiry: new Date("2029-06-30"),
        vehicleType: "suv",
        vehicleNumber: "XYZ5678",
        vehicleModel: "Honda CR-V",
        phoneNumber: "8888888888",
        rating: 4.8,
        isVerified: true,
        isActive: true,
      },
    ];

    for (const data of driverData) {
      const existingDriver = await Driver.findOne({ email: data.email });
      if (existingDriver) {
        console.log(`Driver ${data.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const driver = await Driver.create({ ...data, password: hashedPassword });

      console.log("Driver created:", {
        name: driver.name,
        email: driver.email,
        password: data.password,
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createDriver();
