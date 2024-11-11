require("dotenv").config({ path: "./.env" }); // Adjust the path based on the actual location
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { exec } = require("child_process"); // Add the child_process module
const os = require('os'); // Import the os module

const app = express();
const PORT = process.env.GOOGLE_AI_PORT || 3000; // Use the variable or default to 3000
const SCRIPT_NAME = path.basename(__filename); // Get the current script name
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS === '*' ? '*' : (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost']);

// Convert the ALLOWED_ORIGINS string to an array if it's not already an array
if (typeof ALLOWED_ORIGINS === 'string') {
  ALLOWED_ORIGINS = [ALLOWED_ORIGINS];
}

// Add a function to allow CORS from the specified origins
const corsOptions = {
  origin: (origin, callback) => {
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('http://localhost') || ALLOWED_ORIGINS.includes('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Read the context from the file specified in the .env
let googleAiSystemInstruction;
try {
  const contextFilePath = process.env.CONTEXT;
  if (!contextFilePath) {
    throw new Error("CONTEXT file path is not specified in .env");
  }
  const contextFileContent = fs.readFileSync(contextFilePath, 'utf8');
  const contextData = JSON.parse(contextFileContent);
  googleAiSystemInstruction = contextData.systemInstruction;
  if (!googleAiSystemInstruction) {
    throw new Error("systemInstruction not found in the context file");
  }
} catch (error) {
  console.error("Error reading context file:", error.message);
  process.exit(1);
}

// Confirm that the environment variables were read
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is missing in .env file");
  process.exit(1); // Exit the process with an error code
} else {
  console.log("Environment variables successfully loaded.");
}

// Initialize the model with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: googleAiSystemInstruction, // Use the context from the file
});

// Store chat sessions
const sessions = new Map(); // Use Map to handle sessions by userId

app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Check if the user already has a session
  if (!sessions.has(userId)) {
    // Start a new session for the user
    sessions.set(userId, model.startChat({}));
  }

  try {
    // Get the user's chat session
    const chat = sessions.get(userId);

    // Send the message to the user's chat model
    let result = await chat.sendMessage(message);

    // Extract and log the response text
    let responseText = await result.response.text();
    console.log("Chatbot response:", responseText);

    // Send the response back to the client
    res.json({ text: responseText });
  } catch (error) {
    // Log the error and send an internal server error response
    console.error("Error during chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to stop the server
app.post("/stop", (req, res) => {
  res.json({ message: "Server stopping..." });
  console.log("Stopping server...");
  process.exit(0); // Exit the process with success code
});

// Route to restart the server
app.post("/restart", (req, res) => {
  res.json({ message: "Server restarting..." });
  console.log("Restarting server...");
  exec(`pm2 restart ${SCRIPT_NAME}`, (err, stdout, stderr) => {
    if (err) {
      console.error("Failed to restart the server:", err);
      return;
    }
    console.log("Server restarted successfully:", stdout);
  });
});

// Start the server
const server = http.createServer(app);

server.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'localhost';
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const network of networkInterface) {
      if (network.family === 'IPv4' && !network.internal) {
        ipAddress = network.address;
        break;
      }
    }
    if (ipAddress !== 'localhost') {
      break;
    }
  }
  console.log(`Server listening on port ${PORT}`);
  console.log(`Server running at http://${ipAddress}:${PORT}`); // Print the URL
}).on('error', (err) => {
  console.error(`Failed to start server on port ${PORT}:`, err);
  process.exit(1); // Exit the process with an error code
}).on('connection', (socket) => {
  console.log(`New connection from ${socket.remoteAddress}`); // Log the IP of the connecting client
});