// Hardcoded endpoint
const endpoint = "http://localhost:57380";
// Load marked.js and purify.js from CDN
(async () => {
  await Promise.all([
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "js/marked.js";
      script.onload = resolve;
      document.head.appendChild(script);
    }),
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "js/purify.js";
      script.onload = resolve;
      document.head.appendChild(script);
    }),
  ]);

  const container = document.createElement("div");
  container.className = "button";
  document.body.appendChild(container);

  Vue.createApp({
    template,
    data() {
      return {
        isOpen: false,
        messages: [],
        newMessage: "",
        hasBreakline: false,
        showMenu: false,
        attachmentPreviews: [],
        isRecording: false,
        mediaRecorder: null,
        recordedChunks: [],
        userId: "user_" + Math.random().toString(36).substr(2, 9),
        isLoading: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB max file size
        showOptionsIndex: null,
        inputFocused: false,
        showImageText: true, // New data property
      };
    },
    methods: {
      formatMessage(text) {
        // Remove trailing line breaks
        text = text.replace(/\n+$/, "");
        // Sanitize the text using purify.js
        text = DOMPurify.sanitize(text);
        // Replace <br> with line breaks for proper rendering
        text = text.replace(/<br>/g, '<br>'); // Changed to '<br>'
        return marked.parse(text);
      },
      handleInput(e) {
        this.hasBreakline = this.newMessage.includes("\n");
        const textarea = e.target;
        const lineCount = (this.newMessage.match(/\n/g) || []).length + 1;
        const newHeight = lineCount * 18;
        if (newHeight <= 120) {
          textarea.style.height = `${newHeight}px`;
        }
      },
      handleBlur(e) {
        // Only blur if we're not clicking inside the chat window
        if (!e.relatedTarget || !this.$el.contains(e.relatedTarget)) {
          setTimeout(() => {
            if (!this.newMessage.trim()) {
              this.inputFocused = false;
            }
          }, 200);
        }
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
      handleAttachment() {
        this.$refs.fileInput.click();
        this.showMenu = false;
      },
      onFileSelected(event) {
        const files = Array.from(event.target.files);
        files.forEach((file) => {
          if (file.size > this.maxFileSize) {
            this.attachmentPreviews.push({
              error: `File ${file.name} exceeds 5MB limit`,
            });
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            this.attachmentPreviews.push({
              url: e.target.result,
              type: file.type,
              file: file,
            });
          };
          reader.readAsDataURL(file);
        });
        // Clear the input value to allow for another file to be selected
        event.target.value = "";
      },
      removeAttachment(index) {
        this.attachmentPreviews.splice(index, 1);
      },

      async handleAudio() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          this.mediaRecorder = new MediaRecorder(stream);
          this.recordedChunks = [];
          this.isRecording = true;

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              this.recordedChunks.push(e.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, {
              type: "audio/mp3", // Changed to mp3
            });
            if (blob.size > this.maxFileSize) {
              this.attachmentPreviews.push({
                error: "Audio recording exceeds 5MB limit",
              });
            } else {
              const url = URL.createObjectURL(blob);
              this.attachmentPreviews.push({
                url: url,
                type: "audio/mp3", // Changed to mp3
                file: new File([blob], "audio.mp3", { type: "audio/mp3" }), // Changed to mp3
              });
              // // Send the audio file to the backend for transcription
              // this.transcribeAudio(blob);
            }
            this.isRecording = false;
            stream.getTracks().forEach((track) => track.stop());
          };

          this.mediaRecorder.start();
          this.stopRecordingTimeout = setTimeout(() => {
            if (
              this.mediaRecorder &&
              this.mediaRecorder.state === "recording"
            ) {
              this.mediaRecorder.stop();
            }
          }, 30000);
        } catch (err) {
          console.error("Error accessing microphone:", err);
        }
        this.showMenu = false;
      },

      async sendMessage() {
        if (this.isLoading) return;
        this.isLoading = true;

        // Only send audio if there's no text or other attachments
        if (this.attachmentPreviews.length > 0 && this.attachmentPreviews[0].type !== "audio/mp3") {
          this.isLoading = false;
          return;
        }

        const attachments = [...this.attachmentPreviews];
        this.attachmentPreviews = [];

        this.messages.push({
          text: this.newMessage,
          isUser: true,
          attachment: attachments[0], // Assuming single attachment for now
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        const userInput = this.newMessage;
        this.newMessage = "";

        try {
          let payload = { message: userInput, userId: this.userId };

          if (attachments[0] && attachments[0].file) {
            try {
              if (attachments[0].type.startsWith("image")) {
                payload.image = await this.toBase64(attachments[0].file);
                this.newMessage += " /image";
              } else if (attachments[0].type.startsWith("audio")) {
                payload.audio = await this.toBase64(attachments[0].file);
                this.newMessage += " /audio";
              } else if (attachments[0].type.startsWith("application/pdf")) {
                payload.pdf = await this.toBase64(attachments[0].file);
                this.newMessage += " /pdf";
              }
            } catch (error) {
              console.error("Error converting file to base64:", error);
              this.messages.push({
                text: "Error uploading file. Please try again.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
              this.isLoading = false;
              return;
            }
          }

          const response = await fetch(endpoint + "/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(
              `Network response was not ok: ${response.statusText}`
            );
          }

          const data = await response.json();

          this.messages.push({
            text: data.text,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          // Append the sent image to the input area
          if (data.image) {
            const img = document.createElement("img");
            img.src = data.image;
            img.classList.add("sent-attachment");
            this.$refs.inputArea.appendChild(img);
          } else if (data.audio) {
            const audio = document.createElement("audio");
            audio.src = data.audio;
            audio.controls = true;
            audio.classList.add("sent-attachment");
            this.$refs.inputArea.appendChild(audio);
          } else if (data.pdf) {
            const iframe = document.createElement("iframe");
            iframe.src = data.pdf;
            iframe.classList.add("sent-attachment");
            this.$refs.inputArea.appendChild(iframe);
          }
        } catch (error) {
          console.error("Error:", error);
          this.messages.push({
            text: "Sorry, there was an error processing your message. Please try again.",
            isUser: false,
            error: error.message,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        } finally {
          this.isLoading = false;
        }

        this.$nextTick(() => {
          const container = this.$refs.msgs;
          container.scrollTop = container.scrollHeight;
        });
      },
      toggleOptions(index) {
        this.showOptionsIndex = this.showOptionsIndex === index ? null : index;
      },
      // Function to convert image to base64
      async toBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      },
      
    },
  }).mount(container);
})();

// Part 1:  Chat UI and Vue App Setup
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "css/css.css";
document.head.appendChild(link);
const template = `
     <div class="chat-container">
        <button class="chat-trigger" @click="isOpen = !isOpen">
           <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" xml:space="preserve" width="23" height="23" style="display: block; margin: auto;"><path d="M16.099 0H6.902C3.098 0 0.004 3.095 0.004 6.898v5.365c0 3.804 3.095 6.898 6.898 6.898h0.683c2.67 0 5.181 1.04 7.069 2.928l0.719 0.719a0.653 0.653 0 0 0 1.11 -0.461v-3.198c3.627 -0.2 6.515 -3.213 6.515 -6.888V6.898C22.997 3.095 19.903 0 16.1 0"/></svg>
        </button>
        
            <div class="chat-window"  v-show="isOpen" :class="{ 'fade-in': isOpen }">
            <div class="chat-header">
                <h1  @input="updateTitle" @blur="saveTitle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1.207 1.206" xml:space="preserve" style="display: block; margin: auto;"><path d="M.604 0a.603.603 0 1 0-.002 1.206A.603.603 0 0 0 .604 0m.051.898a.051.051 0 0 1-.101 0V.563a.051.051 0 0 1 .101 0zm0-.52a.05.05 0 0 1-.051.051.05.05 0 0 1-.051-.051V.362c0-.028.023-.051.051-.051s.051.023.051.051z"/></svg>
                 </h1>
                <div class="close-button" @click="isOpen = !isOpen">
                    <div class="hidden" @mouseover="hidden = false" @mouseout="hidden = true" @click="hidden = false">
                    <svg width="14" height="14" viewBox="0 0 0.42 0.42" xmlns="http://www.w3.org/2000/svg"><path d="M0.292 0.152 0.235 0.21l0.058 0.058a0.018 0.018 0 1 1 -0.025 0.025L0.21 0.235l-0.058 0.058a0.018 0.018 0 1 1 -0.025 -0.025L0.185 0.21 0.128 0.152a0.018 0.018 0 1 1 0.025 -0.025L0.21 0.185l0.058 -0.058a0.018 0.018 0 1 1 0.025 0.025"/></svg>
                    </div>
                </div>
            </div>
            <div class="messages-container" ref="msgs" >
                <div v-for="(msg, index) in messages" :class="['message', msg.isUser ? 'user' : 'bot']" @click="toggleOptions(index)">
                    <div class="message-content">
                        <div v-html="formatMessage(msg.text)"></div>
                        <template v-if="msg.attachment">
                            <img v-if="msg.attachment.type.startsWith('image')" :src="msg.attachment.url">
                            <video v-else-if="msg.attachment.type.startsWith('video')" controls :src="msg.attachment.url"></video>
                            <audio v-else-if="msg.attachment.type.startsWith('audio')" controls :src="msg.attachment.url"></audio>
                        </template>
                        <div v-if="msg.error" class="error-message">{{ msg.error }}</div>
                        <div class="wrap-options" v-show="showOptionsIndex === index">
                            <div class="message-timestamp">{{ msg.timestamp }}</div>
                            
                        </div>
                    </div>
                </div>
                <div v-if="isLoading" class="loading-indicator"></div>

            </div>
            <div class="commands"></div>
            <div class="input-area">
                <div v-if="attachmentPreviews.length" class="attachment-preview-area">
                    <div v-for="(preview, index) in attachmentPreviews" class="attachment-preview">
                        <img v-if="preview.type.startsWith('image')" :src="preview.url">
                        <video v-else-if="preview.type.startsWith('video')" :src="preview.url"></video>
                        <button class="remove-attachment" @click="removeAttachment(index)">×</button>
                        <div v-if="preview.error" class="error-message">{{ preview.error }}</div>
                    </div>
                </div>
                <div v-if="isRecording" @click="mediaRecorder.stop()" class="recording-indicator"></div>

                <div class="input-row">
                    <textarea class="message-input" 
                           :class="{ 'multiline': hasBreakline }"
                           v-model="newMessage"
                           @keydown.enter.exact.ctrl="sendMessage"
                           @keydown.enter.exact="sendMessage" // Added this line
                           @input="handleInput"
                           @focus="inputFocused = true"
                           @blur="handleBlur"
                           ref="messageInput"
                           placeholder="Escribe un mensaje..."></textarea>
                    <div class="action-buttons">
                        <button class="attachment-button" @click="toggleMenu">
<svg width="20" height="20" viewBox="0 0 0.6 0.6" xmlns="http://www.w3.org/2000/svg"><path d="M.178.526A.17.17 0 0 1 .125.4V.15a.125.125 0 0 1 .25 0V.4a.075.075 0 0 1-.15 0V.2a.025.025 0 0 1 .05 0v.2a.025.025 0 0 0 .05 0V.15a.075.075 0 0 0-.15 0V.4a.125.125 0 0 0 .129.125.13.13 0 0 0 .121-.131V.1a.025.025 0 0 1 .05 0v.294a.18.18 0 0 1-.17.181H.3A.17.17 0 0 1 .178.526"/></svg>
                            <div class="attachment-menu" :class="{ active: showMenu }" @mouseleave="showMenu = false">
                                <div class="menu-item" @click="handleAttachment">
                                    <input type="file" ref="fileInput" @change="onFileSelected" style="display:none" multiple>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                    </svg>
                                    Attachment
                                </div>
                               
                                <div class="menu-item" @click="handleAudio">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                                    </svg>
                                    Audio
                                </div>
                            </div>
              </button>
                        <button class="send-button" 
                                :class="{ 'visible': newMessage.trim() || attachmentPreviews.length > 0 || isRecording }" 
                                @click="sendMessage"
                                :disabled="isLoading">
                            <svg width="20" height="20" viewBox="0 0 0.5 0.5" xmlns="http://www.w3.org/2000/svg"><path d="M0.275 0.425V0.135l0.082 0.082a0.025 0.025 0 1 0 0.035 -0.035l-0.125 -0.125a0.025 0.025 0 0 0 -0.035 0l-0.125 0.125a0.025 0.025 0 0 0 0 0.035 0.025 0.025 0 0 0 0.035 0L0.225 0.135V0.425a0.025 0.025 0 1 0 0.05 0"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
