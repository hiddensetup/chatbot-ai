
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "src/css.css";
document.head.appendChild(link);
const template = `
     <div class="chat-container">
        <button class="chat-trigger" @click="isOpen = !isOpen">
           <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" xml:space="preserve" width="23" height="23" style="display: block; margin: auto;"><path d="M16.099 0H6.902C3.098 0 0.004 3.095 0.004 6.898v5.365c0 3.804 3.095 6.898 6.898 6.898h0.683c2.67 0 5.181 1.04 7.069 2.928l0.719 0.719a0.653 0.653 0 0 0 1.11 -0.461v-3.198c3.627 -0.2 6.515 -3.213 6.515 -6.888V6.898C22.997 3.095 19.903 0 16.1 0"/></svg>
        </button>
        
        <div class="chat-window" v-show="isOpen">
            <div class="chat-header">
                <h1 contenteditable="true" @input="updateTitle" @blur="saveTitle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1.207 1.206" xml:space="preserve" style="display: block; margin: auto;"><path d="M.604 0a.603.603 0 1 0-.002 1.206A.603.603 0 0 0 .604 0m.051.898a.051.051 0 0 1-.101 0V.563a.051.051 0 0 1 .101 0zm0-.52a.05.05 0 0 1-.051.051.05.05 0 0 1-.051-.051V.362c0-.028.023-.051.051-.051s.051.023.051.051z"/></svg>
                 </h1>
                <div class="close-button" @click="isOpen = !isOpen">
                    <div class="hidden" @mouseover="hidden = false" @mouseout="hidden = true" @click="hidden = false">
                    <svg fill="white" width="19.98px" height="19.98px" viewBox="0 0 0.599 0.599" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="m0.335 0.3 0.132 -0.132a0.025 0.025 0 1 0 -0.035 -0.035L0.3 0.264 0.168 0.132a0.025 0.025 0 1 0 -0.035 0.035L0.264 0.3l-0.132 0.132a0.025 0.025 0 1 0 0.035 0.035L0.3 0.335l0.132 0.132a0.025 0.025 0 0 0 0.035 0 0.025 0.025 0 0 0 0 -0.035z"/></svg>
                    </div>
                </div>
            </div>
            <div class="messages-container" ref="msgs">
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
                            <button class="tts-button" @click="speakMessage(msg.text)" title="Read message">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="isLoading" class="loading-indicator"></div>
            </div>
            <div class="input-area">
                <div v-if="attachmentPreviews.length" class="attachment-preview-area">
                    <div v-for="(preview, index) in attachmentPreviews" class="attachment-preview">
                        <img v-if="preview.type.startsWith('image')" :src="preview.url">
                        <video v-else-if="preview.type.startsWith('video')" :src="preview.url"></video>
                        <button class="remove-attachment" @click="removeAttachment(index)">×</button>
                        <div v-if="preview.error" class="error-message">{{ preview.error }}</div>
                    </div>
                </div>
                <div v-if="isRecording" class="recording-indicator"></div>
                <div class="input-row">
                    <textarea class="message-input" 
                           :class="{ 'multiline': hasBreakline }"
                           v-model="newMessage"
                           @keydown.enter.exact.ctrl="sendMessage"
                           @input="handleInput"
                           @focus="inputFocused = true"
                           @blur="handleBlur"
                           ref="messageInput"
                           placeholder="Escribe un mensaje..."></textarea>
                    <div class="action-buttons">
                        <button class="attachment-button" @click="toggleMenu">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                            </svg>
                            <div class="attachment-menu" :class="{ active: showMenu }" @mouseleave="showMenu = false">
                                <div class="menu-item" @click="handleAttachment">
                                    <input type="file" ref="fileInput" @change="onFileSelected" style="display:none" multiple>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                    </svg>
                                    Attachment
                                </div>
                                <div class="menu-item" @click="handleCamera">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                                    </svg>
                                    Camera
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
                                :class="{ 'visible': newMessage.trim() }" // Removed inputFocused from the condition
                                @click="sendMessage"
                                :disabled="!newMessage.trim() && attachmentPreviews.length === 0 && !isRecording || isLoading">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
(function () {
  const container = document.createElement("div");
  container.className = "button";
  document.body.appendChild(container);

  const markedJsUrl = "js/marked.js";
  const purifyJsUrl = "js/purify.js"; // Added purify.js URL

  // Hardcoded endpoint
  const endpoint = "http://localhost:57380";

  (async () => {
    // Load marked.js from CDN
    await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = markedJsUrl;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    // Load purify.js from CDN
    await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = purifyJsUrl;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    const container = document.createElement("div");
    container.className = "button";
    document.body.appendChild(container);

    Vue.createApp({
      template,
      data() {
        return {
          isOpen: false,
          messages: [
            {
              text: `<div style="display:flex"> <span>Hola </span><svg width="20" height="20" viewBox="0 0 0.6 0.6" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#black}</style></defs><g data-name="Product Icons"><path class="cls-1" d="M.383.05v.059H.329V.05H.271v.059H.217V.05h-.06v.059a.05.05 0 0 0-.048.048H.05v.059h.059V.27H.05v.059h.059v.054H.05v.059h.059A.05.05 0 0 0 .157.49v.06h.059V.491H.27V.55h.058V.491h.054V.55h.059V.491A.05.05 0 0 0 .489.443H.55V.384H.491V.33H.55V.271H.491V.217H.55v-.06H.491A.05.05 0 0 0 .443.109V.05Zm.038.381H.178a.01.01 0 0 1-.01-.01V.178a.01.01 0 0 1 .01-.01h.243a.01.01 0 0 1 .01.01v.243a.01.01 0 0 1-.01.01"/><path class="cls-1" d="M.321.189v.089H.37L.282.4V.309H.231z"/></g></svg></div> `,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
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
          speechSynthesis: window.speechSynthesis,
          showOptionsIndex: null,
          inputFocused: false,
        };
      },
      methods: {
        formatMessage(text) {
          // Remove trailing line breaks
          text = text.replace(/\n+$/, "");
          // Sanitize the text using purify.js
          text = DOMPurify.sanitize(text);
          return marked.parse(text);
        },
        speakMessage(text) {
          this.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          this.speechSynthesis.speak(utterance);
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
        },
        removeAttachment(index) {
          this.attachmentPreviews.splice(index, 1);
        },
        async handleCamera() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
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
                type: "video/webm",
              });
              if (blob.size > this.maxFileSize) {
                this.attachmentPreviews.push({
                  error: "Video recording exceeds 5MB limit",
                });
              } else {
                const url = URL.createObjectURL(blob);
                this.attachmentPreviews.push({
                  url: url,
                  type: "video/webm",
                  file: new File([blob], "video.webm", { type: "video/webm" }),
                });
              }
              this.isRecording = false;
              stream.getTracks().forEach((track) => track.stop());
            };

            this.mediaRecorder.start();
            setTimeout(() => {
              if (
                this.mediaRecorder &&
                this.mediaRecorder.state === "recording"
              ) {
                this.mediaRecorder.stop();
              }
            }, 3000);
          } catch (err) {
            console.error("Error accessing camera:", err);
          }
          this.showMenu = false;
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
                type: "audio/webm",
              });
              if (blob.size > this.maxFileSize) {
                this.attachmentPreviews.push({
                  error: "Audio recording exceeds 5MB limit",
                });
              } else {
                const url = URL.createObjectURL(blob);
                this.attachmentPreviews.push({
                  url: url,
                  type: "audio/webm",
                  file: new File([blob], "audio.webm", { type: "audio/webm" }),
                });
              }
              this.isRecording = false;
              stream.getTracks().forEach((track) => track.stop());
            };

            this.mediaRecorder.start();
            setTimeout(() => {
              if (
                this.mediaRecorder &&
                this.mediaRecorder.state === "recording"
              ) {
                this.mediaRecorder.stop();
              }
            }, 3000);
          } catch (err) {
            console.error("Error accessing microphone:", err);
          }
          this.showMenu = false;
        },
        async sendMessage() {
          if (
            (!this.newMessage.trim() && this.attachmentPreviews.length === 0) ||
            this.isLoading
          )
            return;

          this.isLoading = true;

          const attachments = [...this.attachmentPreviews];
          this.attachmentPreviews = [];

          this.messages.push({
            text: this.newMessage,
            isUser: true,
            attachment: attachments[0],
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });

          const userInput = this.newMessage;
          this.newMessage = "";
          this.hasBreakline = false;

          // Reset textarea height
          if (this.$refs.messageInput) {
            this.$refs.messageInput.style.height = "18px";
          }

          try {
            const response = await fetch(endpoint + "/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: userInput,
                userId: this.userId,
              }),
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
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
          this.showOptionsIndex =
            this.showOptionsIndex === index ? null : index;
        },
      },
    }).mount(container);
  })();
})();
