const mongoose = require("mongoose");

// Function to connect to MongoDB
const connectToDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/chat",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "chat",
      }
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = connectToDB;
