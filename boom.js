require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const PORT = process.env.GOOGLE_AI_PORT || 3000;
const SCRIPT_NAME = path.basename(__filename);

// ----------------------------------------------------------------------------
//  CORS Configuration
// ----------------------------------------------------------------------------
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS === "*"
  ? "*"
  : process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost"];

const corsOptions = {
  origin: (origin, callback) => {
    if (ALLOWED_ORIGINS === "*" || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

// ----------------------------------------------------------------------------
//  Load System Instructions
// ----------------------------------------------------------------------------
let googleAiSystemInstruction;
try {
  const contextFilePath = process.env.CONTEXT || path.join(__dirname, "context.json");
  const contextData = JSON.parse(fs.readFileSync(contextFilePath, "utf8"));
  googleAiSystemInstruction = contextData.systemInstruction;
  console.log("System instruction loaded successfully");
} catch (error) {
  console.error("Error reading context file:", error.message);
  process.exit(1);
}

// ----------------------------------------------------------------------------
//  Initialize AI Components
// ----------------------------------------------------------------------------
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is missing in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const modelName = process.env.MODEL;
const multiModal = genAI.getGenerativeModel({
  model: process.env.MODEL,
  systemInstruction: googleAiSystemInstruction,
});
const model = genAI.getGenerativeModel({
  model: modelName,
  systemInstruction: googleAiSystemInstruction,
});

// ----------------------------------------------------------------------------
//  Session and History Management
// ----------------------------------------------------------------------------
const sessions = new Map();
const dbFilePath = "db.json";

if (!fs.existsSync(dbFilePath)) fs.writeFileSync(dbFilePath, "[]");

async function loadChatHistory() {
  return JSON.parse(await fs.promises.readFile(dbFilePath));
}

async function saveChatHistory(chatHistory) {
  await fs.promises.writeFile(dbFilePath, JSON.stringify(chatHistory, null, 2));
}

let chatHistory;
loadChatHistory()
  .then((data) => chatHistory = data)
  .catch((err) => {
    console.error("Error loading chat history:", err);
    chatHistory = [];
  });

// ----------------------------------------------------------------------------
//  Helper Functions to Process Media Files
// ----------------------------------------------------------------------------

// Process and upload an image file
async function processImage(imageData) {
  const filename = `${Date.now()}.png`;
  const imagePath = path.join("uploads", filename);
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  await fs.promises.writeFile(imagePath, base64Data, "base64");
  const uploadResult = await fileManager.uploadFile(imagePath, { mimeType: "image/png", displayName: filename });
  await fs.promises.unlink(imagePath);
  console.log(`File ${uploadResult.file.uri} uploaded successfully`); // Added console.log
  return uploadResult.file.uri;
}

// Process and upload an audio file
async function processAudio(audioData) {
  const filename = `${Date.now()}.mp3`;
  const audioPath = path.join("uploads", filename);
  const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, "");
  await fs.promises.writeFile(audioPath, base64Data, "base64");
  const uploadResult = await fileManager.uploadFile(audioPath, { mimeType: "audio/mp3", displayName: filename });
  await fs.promises.unlink(audioPath);
  console.log(`File ${uploadResult.file.uri} uploaded successfully`); // Added console.log
  return uploadResult.file.uri;
}

// Process and upload a PDF file
async function processPDF(pdfData) {
  const filename = `${Date.now()}.pdf`;
  const pdfPath = path.join("uploads", filename);
  const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");
  await fs.promises.writeFile(pdfPath, base64Data, "base64");
  const uploadResult = await fileManager.uploadFile(pdfPath, { mimeType: "application/pdf", displayName: filename });
  await fs.promises.unlink(pdfPath);
  console.log(`File ${uploadResult.file.uri} uploaded successfully`); // Added console.log
  return uploadResult.file.uri;
}

// ----------------------------------------------------------------------------
//  Enhanced Chat Endpoint with Media Analysis
// ----------------------------------------------------------------------------
app.post("/chat", async (req, res) => {
  const { message, userId, image, audio, pdf, replyTo } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    let response, fileUri = null, mimeType = null, modifiedMessage = message, currentHistory = [], replyToId = null;
    if (!sessions.has(userId)) sessions.set(userId, model.startChat({}));
    const chat = sessions.get(userId);

    let userChatHistory = chatHistory.find(user => user.userId === userId);
    if (!userChatHistory) {
      userChatHistory = { userId, conversations: [{ conversationId: `conv_${Date.now()}`, messages: [] }] };
      chatHistory.push(userChatHistory);
    }
    const conversation = userChatHistory.conversations[0];

    const getMessageByIdOrLast = (id) => id ? conversation.messages.find(msg => msg.messageId === id) : conversation.messages.slice().reverse().find(msg => msg.user_type === "user" || msg.user_type === "assistant");

    const buildConversationHistory = (replyToId) => {
      const history = [];
      if (replyToId) {
        const contextWindow = conversation.messages.slice(Math.max(0, conversation.messages.findIndex(msg => msg.messageId === replyToId) - 4));
        contextWindow.forEach(msg => history.push(msg.hasMedia && msg.fileUri ? { fileData: { fileUri: msg.fileUri, mimeType: msg.mimeType } } : msg.content));
      }
      return history;
    };

    const handleMessageCommand = () => {
      const messageCommandMatch = message.match(/\/message(?:-(\d+))?/);
      if (messageCommandMatch) {
        const specifiedId = messageCommandMatch[1] ? parseInt(messageCommandMatch[1], 10) : null;
        const referencedMessage = getMessageByIdOrLast(specifiedId);
        if (referencedMessage) {
          const quotedContent = `> ${referencedMessage.content}`;
          modifiedMessage = modifiedMessage.replace(`/message${specifiedId ? `-${specifiedId}` : ""}`, quotedContent);
          if (referencedMessage.hasMedia && referencedMessage.fileUri) {
            fileUri = referencedMessage.fileUri;
            mimeType = referencedMessage.mimeType;
          }
          replyToId = referencedMessage.messageId;
        } else {
          return res.status(400).json({ error: `No message found with ID ${specifiedId}.` });
        }
      }
    };

    handleMessageCommand();

    const handleMediaCommand = async (type, processFunc, lastMimeType) => {
      const lastMediaMessage = conversation.messages.slice().reverse().find(msg => msg.hasMedia && msg.fileUri && msg.mimeType === lastMimeType);
      if (message.includes(`/${type}`)) {
        if (!lastMediaMessage) return res.status(400).json({ error: `No previous ${type} found to reuse.` });
        modifiedMessage = message.replace(`/${type}`, `\n> ${lastMediaMessage.content}`);
        fileUri = lastMediaMessage.fileUri;
        mimeType = lastMediaMessage.mimeType;
      } else if (req.body[type]) {
        fileUri = await processFunc(req.body[type]);
        mimeType = lastMimeType;
      }
    };

    await handleMediaCommand("image", processImage, "image/png");
    await handleMediaCommand("audio", processAudio, "audio/mp3");
    await handleMediaCommand("pdf", processPDF, "application/pdf");

    currentHistory = buildConversationHistory(replyTo || replyToId);
    if (modifiedMessage) currentHistory.push(modifiedMessage);
    if (fileUri) currentHistory.push({ fileData: { fileUri, mimeType } });

    const result = currentHistory.some(item => item.fileData)
      ? await multiModal.generateContent(currentHistory)
      : await chat.sendMessage(currentHistory.join("\n"));

    response = await result.response.text();
    const nextMessageId = conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].messageId + 1 : 1;

    conversation.messages.push({
      messageId: nextMessageId, user_type: "user", content: modifiedMessage, hasMedia: !!fileUri,
      fileUri, mimeType, timestamp: new Date().toISOString(), replyTo: replyTo || replyToId
    });
    conversation.messages.push({ messageId: nextMessageId + 1, user_type: "assistant", content: response, timestamp: new Date().toISOString() });

    await saveChatHistory(chatHistory);
    res.json({ text: response, hasMedia: !!fileUri, analyzed: !!fileUri, messageId: nextMessageId + 1 });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
// ----------------------------------------------------------------------------
//  File Management API Endpoints
// ----------------------------------------------------------------------------

app.get("/listFiles", async (req, res) => {
  try {
    const listFilesResponse = await fileManager.listFiles();
    res.json(listFilesResponse);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Delete a file by its name.
// Example usage: DELETE /deleteFile/my_file.pdf
app.delete("/deleteFile/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  try {
    await fileManager.deleteFile(fileName);
    res.json({ message: `File ${fileName} deleted successfully` });
  } catch (error) {
    console.error("Error deleting file:", error);
    if (error.message.includes("File not found")) {
      res.status(404).json({ error: "File not found" });
    } else {
      res.status(500).json({ error: "Failed to delete file" });
    }
  }
});

// Endpoint to delete all files
// Example usage: DELETE /deleteAll
app.delete("/deleteAll", async (req, res) => {
  try {
    const listFilesResponse = await fileManager.listFiles();
    for (const file of listFilesResponse.files) {
      await fileManager.deleteFile(file.name);
      console.log(`File ${file.displayName} deleted successfully`);
    }
    res.json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ error: "Failed to delete files" });
  }
});

// ----------------------------------------------------------------------------
//  Helper function to delete a file from the terminal
// ----------------------------------------------------------------------------
async function deleteAllFiles() {
  try {
    const listFilesResponse = await fileManager.listFiles();
    for (const file of listFilesResponse.files) {
      await fileManager.deleteFile(file.name);
      console.log(`File ${file.displayName} deleted successfully`);
    }
    console.log("All files deleted successfully");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
}

// Example usage from the terminal:
// node boom.js deleteAllFiles
// node boom.js deleteFile "my_file.pdf"
if (process.argv[2] === "deleteAllFiles") {
  deleteAllFiles();
} else if (process.argv[2] === "deleteFile" && process.argv[3]) {
  const fileName = process.argv[3];
  fileManager
    .deleteFile(fileName)
    .then(() => console.log(`File ${fileName} deleted successfully`))
    .catch((error) => console.error(`Error deleting file ${fileName}:`, error));
}



// ----------------------------------------------------------------------------
//  Retrieve Last Conversation
// ----------------------------------------------------------------------------
app.get("/lastConversation/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userChatHistory = chatHistory.find(user => user.userId === userId);
  if (!userChatHistory) {
    return res.status(404).json({ error: "No conversation history found for this user ID." });
  }
  const messages = userChatHistory.conversations[0].messages;
  // Replace Google Cloud Storage URLs with a slug API endpoint
  messages.forEach(message => {
    if (message.fileUri) {
      message.fileUri = `/file/${message.fileUri}`; // Replace with your slug API endpoint
    }
  });
  res.json(messages);
});

// ----------------------------------------------------------------------------
//  Start Server
// ----------------------------------------------------------------------------
const server = http.createServer(app);

server.listen(PORT, () => {
  const ipAddress = Object.values(os.networkInterfaces()).flat().find(net => net.family === "IPv4" && !net.internal)?.address || "localhost";
  console.log(`Server running at http://${ipAddress}:${PORT}`);
}).on("error", (err) => {
  console.error(`Failed to start server on port ${PORT}:`, err);
  process.exit(1);
});
