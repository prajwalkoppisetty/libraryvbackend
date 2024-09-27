const express = require("express");
const mongoose = require("mongoose");
const User = require('./Users'); // Your User model
const cors = require("cors");
const multer = require('multer'); // Import multer
const bodyparser = require("body-parser");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const secretKey = "SGPV";

const app = express();

app.use(bodyparser.json());

const mongodbUrl = "mongodb://localhost:27017/SGPV-libraryy";

mongoose.connect(mongodbUrl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
    origin: 'http://localhost:5173', // Allow only the frontend URL
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Rename file with unique suffix
    }
});

const upload = multer({ storage: storage });

// Ensure the 'uploads' folder exists for file storage
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Signup route
app.post('/signup', upload.single('file'), async (req, res) => {
    try {
        const { name, pinNumber, regulationNumber, password, branch, mobilenumber } = req.body;
        const file = req.file; // The uploaded file object

        // Validate data (e.g., check for missing fields)
        if (!name || !pinNumber || !regulationNumber || !password || !branch || !mobilenumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the pinNumber already exists
        const existingUser = await User.findOne({ pinNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Pin number already exists' });
        }

        // Insert data into MongoDB
        const newUser = new User({
            name,
            pinNumber,
            regulationNumber,
            password,
            branch,
            mobilenumber,
            file: file ? file.path.replace(/\\/g, '/') : null, // Use forward slashes for file paths
        });
        await newUser.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(400).json({ message: 'Signup failed: ' + error.message });
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

// Login route
app.get("/login", async (req, res) => {
    try {
        const { pinNumber, password } = req.query;

        if (!pinNumber || !password) {
            return res.status(400).json({ message: "Pin number and Password are required" });
        }

        const user = await User.findOne({ pinNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Create JWT token
        const token = jwt.sign({
            userbranch: user.branch,
            pinnumber: user.pinNumber,
            name: user.name,
            role: user.role, // Ensure you have a role field in your User model
            mobilenumber: user.mobilenumber,
            regulation: user.regulationNumber,
            file: user.file
        }, secretKey, { expiresIn: '1h' });

        // Send the token back to the client
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Login failed: " + error.message });
    }
});

app.get("/cart",async(req,res)=>{
    res.status(400).json({message:"this is cart server"})
})