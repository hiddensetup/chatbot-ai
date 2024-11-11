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
const ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS === "*"
    ? "*"
    : process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost"];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (ALLOWED_ORIGINS === "*") {
      callback(null, true);
    } else if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

// ----------------------------------------------------------------------------
//  Load system instruction
// ----------------------------------------------------------------------------
let googleAiSystemInstruction;
try {
  const contextFilePath = process.env.CONTEXT || path.join(__dirname, "context.json");
  const defaultContext = { "systemInstruction": "atender amable" };
  if (!contextFilePath) {
    throw new Error("CONTEXT file path is not specified in .env");
  }
  const contextFileContent = fs.readFileSync(contextFilePath, "utf8");
  const contextData = JSON.parse(contextFileContent);
  googleAiSystemInstruction = contextData.systemInstruction;
  console.log("System instruction loaded successfully");
} catch (error) {
  console.error("Error reading context file:", error.message);
  process.exit(1);
}

// ----------------------------------------------------------------------------
//  Initialize AI components
// ----------------------------------------------------------------------------
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is missing in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const modelName = process.env.MODEL;  
console.log(`Using model: ${modelName}`);

const multiModal = genAI.getGenerativeModel({
  model: process.env.MODEL,
  systemInstruction: googleAiSystemInstruction,
});

const model = genAI.getGenerativeModel({
  model: modelName,
  systemInstruction: googleAiSystemInstruction,
});

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

// ----------------------------------------------------------------------------
//  Session and history management
// ----------------------------------------------------------------------------
const sessions = new Map();
const dbFilePath = "db.json";

if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, "[]");
}

async function loadChatHistory() {
  return JSON.parse(await fs.promises.readFile(dbFilePath));
}

async function saveChatHistory(chatHistory) {
  await fs.promises.writeFile(dbFilePath, JSON.stringify(chatHistory, null, 2));
}

let chatHistory;
loadChatHistory()
  .then((data) => {
    chatHistory = data;
  })
  .catch((err) => {
    console.error("Error loading chat history:", err);
    chatHistory = [];
  });
// ----------------------------------------------------------------------------
//  Helper function to process image
// ----------------------------------------------------------------------------
async function processImage(imageData) {
  try {
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `${Date.now()}.png`;
    const imagePath = path.join(uploadsDir, filename);

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    await fs.promises.writeFile(imagePath, base64Data, "base64");

    const uploadResult = await fileManager.uploadFile(imagePath, {
      mimeType: "image/png",
      displayName: filename,
    });

    // Clean up the temporary file
    await fs.promises.unlink(imagePath); // This line was already present

    return uploadResult.file.uri;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

// ----------------------------------------------------------------------------
//  Helper function to process audio
// ----------------------------------------------------------------------------
async function processAudio(audioData) {
  try {
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `${Date.now()}.mp3`;
    const audioPath = path.join(uploadsDir, filename);

    // Remove data URL prefix if present
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, "");
    await fs.promises.writeFile(audioPath, base64Data, "base64");

    const uploadResult = await fileManager.uploadFile(audioPath, {
      mimeType: "audio/mp3",
      displayName: filename,
    });

    // Clean up the temporary file
    await fs.promises.unlink(audioPath);

    return uploadResult.file.uri;
  } catch (error) {
    console.error("Error processing audio:", error);
    throw new Error("Failed to process audio");
  }
}

// ----------------------------------------------------------------------------
//  Helper function to process PDF
// ----------------------------------------------------------------------------
async function processPDF(pdfData) {
  try {
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `${Date.now()}.pdf`;
    const pdfPath = path.join(uploadsDir, filename);

    // Remove data URL prefix if present
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");
    await fs.promises.writeFile(pdfPath, base64Data, "base64");

    const uploadResult = await fileManager.uploadFile(pdfPath, {
      mimeType: "application/pdf",
      displayName: filename,
    });

    // Clean up the temporary file
    await fs.promises.unlink(pdfPath);

    return uploadResult.file.uri;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process PDF");
  }
}

// ----------------------------------------------------------------------------
//  Enhanced chat endpoint with image analysis
// ----------------------------------------------------------------------------

app.post("/chat", async (req, res) => {
  const { message, userId, image, audio, pdf, replyTo } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    let response;
    let fileUri = null;
    let mimeType = null;
    let modifiedMessage = message;
    let currentHistory = [];
    let replyToId = null; // Initialize replyToId

    // Retrieve or initialize user session and chat history
    if (!sessions.has(userId)) {
      sessions.set(userId, model.startChat({}));
    }
    const chat = sessions.get(userId);

    // Retrieve or initialize chat history
    let userChatHistory = chatHistory.find((user) => user.userId === userId);
    if (!userChatHistory) {
      userChatHistory = {
        userId,
        conversations: [
          {
            conversationId: `conv_${Date.now()}`,
            messages: [],
          },
        ],
      };
      chatHistory.push(userChatHistory);
    }
    const conversation = userChatHistory.conversations[0];

    // Function to retrieve message by ID or get the last message
    const getMessageByIdOrLast = (id) => {
      if (id) {
        return (
          conversation.messages.find((msg) => msg.messageId === id) || null
        );
      }
      for (let i = conversation.messages.length - 1; i >= 0; i--) {
        const msg = conversation.messages[i];
        if (msg.user_type === "user" || msg.user_type === "assistant") {
          return msg;
        }
      }
      return null;
    };

    // Build conversation history for context
    const buildConversationHistory = (replyToId) => {
      const history = [];
      if (replyToId) {
        const messageIndex = conversation.messages.findIndex(
          (msg) => msg.messageId === replyToId
        );
        if (messageIndex !== -1) {
          const contextWindow = conversation.messages.slice(
            Math.max(0, messageIndex - 4),
            messageIndex + 1
          );
          contextWindow.forEach((msg) => {
            if (msg.hasMedia && msg.fileUri) {
              history.push({
                fileData: {
                  fileUri: msg.fileUri,
                  mimeType: msg.mimeType,
                },
              });
            }
            history.push(msg.content);
          });
        }
      }
      return history;
    };

    // Handle /message and /message-<id> command
    const messageCommandMatch = message.match(/\/message(?:-(\d+))?/);
    if (messageCommandMatch) {
      const specifiedId = messageCommandMatch[1]
        ? parseInt(messageCommandMatch[1], 10)
        : null;
      const referencedMessage = getMessageByIdOrLast(specifiedId);

      if (referencedMessage) {
        const quotedContent = `> ${referencedMessage.content}`;
        modifiedMessage = modifiedMessage.replace(
          `/message${specifiedId ? `-${specifiedId}` : ""}`,
          quotedContent
        );

        if (referencedMessage.hasMedia && referencedMessage.fileUri) {
          fileUri = referencedMessage.fileUri;
          mimeType = referencedMessage.mimeType;
        }
        replyToId = referencedMessage.messageId;
      } else {
        return res.status(400).json({
          error: `No message found with ID ${specifiedId}.`,
        });
      }
    }

    // Handle /image command
    if (message.includes("/image")) {
      const lastImageMessage = conversation.messages
        .slice()
        .reverse()
        .find((msg) => msg.hasMedia && msg.fileUri && msg.mimeType === "image/png");

      if (!lastImageMessage) {
        return res.status(400).json({
          error: "No previous image found to reuse.",
        });
      }

      modifiedMessage = message.replace(
        "/image",
        `\n> ${lastImageMessage.content}`
      );
      fileUri = lastImageMessage.fileUri;
      mimeType = lastImageMessage.mimeType;
      console.log("Reusing previous image URI:", fileUri);
    } else if (image) {
      console.log("Processing new image with message:", message);
      fileUri = await processImage(image);
      mimeType = "image/png";
      console.log("Image processed and uploaded:", fileUri);
    }

    // Handle /audio command
    if (message.includes("/audio")) {
      const lastAudioMessage = conversation.messages
        .slice()
        .reverse()
        .find((msg) => msg.hasMedia && msg.fileUri && msg.mimeType === "audio/mp3");

      if (!lastAudioMessage) {
        return res.status(400).json({
          error: "No previous audio found to reuse.",
        });
      }

      modifiedMessage = message.replace(
        "/audio",
        `\n> ${lastAudioMessage.content}`
      );
      fileUri = lastAudioMessage.fileUri;
      mimeType = lastAudioMessage.mimeType;
      console.log("Reusing previous audio URI:", fileUri);
    } else if (audio) {
      console.log("Processing new audio with message:", message);
      fileUri = await processAudio(audio);
      mimeType = "audio/mp3";
      console.log("Audio processed and uploaded:", fileUri);
      // Add a default message if audio is received without text
      if (!message) {
        modifiedMessage = "This is an audio message. Please respond to it as if it were a text message. I will try to understand the audio and respond accordingly.";
      }
    }

    // Handle /pdf command
    if (message.includes("/pdf")) {
      const lastPdfMessage = conversation.messages
        .slice()
        .reverse()
        .find((msg) => msg.hasMedia && msg.fileUri && msg.mimeType === "application/pdf");

      if (!lastPdfMessage) {
        return res.status(400).json({
          error: "No previous PDF found to reuse.",
        });
      }

      modifiedMessage = message.replace(
        "/pdf",
        `\n> ${lastPdfMessage.content}`
      );
      fileUri = lastPdfMessage.fileUri;
      mimeType = lastPdfMessage.mimeType;
      console.log("Reusing previous PDF URI:", fileUri);
    } else if (pdf) {
      console.log("Processing new PDF with message:", message);
      fileUri = await processPDF(pdf);
      mimeType = "application/pdf";
      console.log("PDF processed and uploaded:", fileUri);
    }

    // Build conversation history
    currentHistory = buildConversationHistory(replyTo || replyToId);

    // Add current message and image to history
    if (modifiedMessage) {
      currentHistory.push(modifiedMessage);
    }

    if (fileUri) {
      currentHistory.push({
        fileData: {
          fileUri: fileUri,
          mimeType: mimeType,
        },
      });
    }

    // Generate response using the appropriate model
    const result = currentHistory.some((item) => item.fileData)
      ? await multiModal.generateContent(currentHistory)
      : await chat.sendMessage(currentHistory.join("\n"));

    response = await result.response.text();

    // Generate new message IDs
    const nextMessageId =
      conversation.messages.length > 0
        ? conversation.messages[conversation.messages.length - 1].messageId + 1
        : 1;

    // Store current user message and assistant's response
    conversation.messages.push({
      messageId: nextMessageId,
      user_type: "user",
      content: modifiedMessage,
      hasMedia: !!fileUri,
      fileUri: fileUri || null,
      mimeType: mimeType || null,
      timestamp: new Date().toISOString(),
      replyTo: replyTo || replyToId || null, // Use replyTo if available, otherwise replyToId
    });

    conversation.messages.push({
      messageId: nextMessageId + 1,
      user_type: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    });

    await saveChatHistory(chatHistory);

    res.json({
      text: response,
      hasMedia: !!fileUri,
      analyzed: !!fileUri,
      messageId: nextMessageId + 1,
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
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


// ----------------------------------------------------------------------------
//  API endpoint to retrieve the last conversation
// ----------------------------------------------------------------------------
app.get("/lastConversation/:userId", async (req, res) => {
  // This API endpoint retrieves the last conversation for a given user.
  // Example usage: GET /lastConversation/12345
  const userId = req.params.userId;
  try {
    const userChatHistory = chatHistory.find((user) => user.userId === userId);
    if (!userChatHistory) {
      return res.status(404).json({ error: "User not found" });
    }
    const conversation = userChatHistory.conversations[0];
    res.json(conversation.messages);
  } catch (error) {
    console.error("Error retrieving last conversation:", error);
    res.status(500).json({ error: "Failed to retrieve last conversation" });
  }
});

// ----------------------------------------------------------------------------
//  Start server
// ----------------------------------------------------------------------------
const server = http.createServer(app);

server
  .listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    let ipAddress = "localhost";

    for (const interfaceName in networkInterfaces) {
      const networkInterface = networkInterfaces[interfaceName];
      for (const network of networkInterface) {
        if (network.family === "IPv4" && !network.internal) {
          ipAddress = network.address;
          break;
        }
      }
      if (ipAddress !== "localhost") break;
    }

    console.log(`Server running at http://${ipAddress}:${PORT}`);
  })
  .on("error", (err) => {
    console.error(`Failed to start server on port ${PORT}:`, err);
    process.exit(1);
  });
