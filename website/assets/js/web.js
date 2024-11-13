

let endpoint = "";

fetch("assets/js/endpoint.json")
  .then((response) => response.json())
  .then((data) => {
    endpoint = atob(data.url);
  })
  .catch((error) => {
    console.error("Error fetching endpoint:", error);
  });



const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'assets/css/css.css';
document.head.appendChild(link);

// CSS STYLE
// const style = document.createElement("style");
// style.innerHTML = `:root{--chat-info-color-blue:#007AFF;--chat-info-color:#7fff9a;--chat-secondary-color:#333;--chat-tertiary-color:#e5e5e5;--chat-primary-background-color:#ffffff;--chat-secondary-background-color:rgb(12 14 19 / 9%);--chat-brand-button-color:#15141f;--chat-border-color:#e5e5e5;--text-app-color:rgb(24, 23, 23);--shadow-color:rgba(0, 0, 0, .1);--shadow-div-chat-container:0 2px 3px 0 rgb(0 0 0 / 21%)}.div-chat-box{position:fixed;bottom:8px;right:18px;z-index:8000;font-family:-apple-system, BlinkMacSystemFont, sans-serif}.button-chat-trigger{width:60px;height:60px;border-radius:40px;background:var(--chat-brand-button-color);border:none;color:var(--chat-tertiary-color);cursor:pointer;box-shadow:0 2px 10px var(--shadow-color);transition:transform 0.2s;transform-origin:50% 50%}.button-chat-trigger:active{transform:scale(0.98);box-shadow:0 1px 5px var(--shadow-color)}.div-chat-container{position:absolute;bottom:70px;right:0;min-width:300px;min-height:280px;background:var(--chat-primary-background-color);border-radius:15px;box-shadow:var(--shadow-div-chat-container);display:flex;flex-direction:column;max-width:800px}.chat-header{height:50px;background:var(--chat-secondary-background-color);backdrop-filter: blur(10px);border-radius:12px 12px 0 0;font-weight:500;border-bottom:1px solid var(--chat-border-color);display:flex;align-items:center;justify-content:space-between;padding:0 16px}.chat-header h1{position: relative; font-size: 22px; color: #333; cursor: pointer; margin: 0; display: flex; justify-content: center; gap: 6px;}.chat-header h1 > svg{fill:var(--chat-brand-button-color)}.div-info-header{background:var(--chat-info-color);text-align:center;padding:3px;font-size:12px}.timer-session{text-align:center;opacity:0;transition:opacity 0.5s ease-in-out}.timer-session.active{opacity:1}.timer-session > div{background:var(--chat-info-color-blue);text-align:center;padding:4px 8px;color:white;font-size:12px;cursor:pointer;}.div-messages-container{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:28px;max-height:360px;scroll-behavior:smooth}.message{max-width:90%;display:flex;position:relative}.message.user{margin-left:auto;flex-direction:row-reverse}.message-content{cursor:pointer;padding:8px 4px;border-radius:16px;background:white;box-shadow:0 1px 3px var(--chat-border-color);color:#1d1d1f;position:relative}.message.user .message-content{background:var(--chat-brand-button-color);color:var(--chat-tertiary-color);display:flex;flex-direction:column-reverse}.message-content em{font-style:italic}.message-content strong{font-weight:bold}.message-content code{font-family:inherit;background:rgba(0, 0, 0, 0.05);padding:2px 4px;border-radius:4px}.message-content del{text-decoration:line-through}.message-content audio,.message-content img,.message-content video{max-width:300px;max-height:400px;object-fit:cover;border-radius:8px}.message-id,.message-timestamp{font-size:10px;color:#999;inline-size:max-content}.message.user .message-timestamp{font-size:10px;color:#999}.command-button{background:black;border-radius:30px;width:fit-content;font-size:10px;color:aliceblue;padding:6px 15px}.wrap-options{position:absolute;display:flex;align-items:center;gap:4px;flex-direction:row-reverse;bottom:-18px;right:10px}.input-area{padding:8px;background:transparent;backdrop-filter: blur(10px);border-top:1px solid var(--chat-border-color);display:flex;flex-direction:column;gap:8px;border-radius:0 0 15px 15px}.attachment-preview-area{display:flex;gap:8px;padding:0 4px}.attachment-preview{position:relative;width:40px;height:40px;border-radius:8px;background:#eee;overflow:hidden}.attachment-preview img,.attachment-preview video{width:100%;height:100%;object-fit:cover}.close-button{line-height:0;background:rgb(0 0 0 / 4%);position:absolute;border-radius:50%;right:15px;top:50%;transform:translateY(-50%);opacity:1;transition:opacity 0.5s, color 0.5s;display:flex;align-items:center;justify-content:center}.close-button:hover{background:#fe5f58;border-radius:50%}.attachment-preview .remove-attachment{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:rgba(0, 0, 0, .5);color:var(--chat-tertiary-color);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center}.input-row{display:flex;gap:8px;align-items:flex-end}.message-input{flex:1;padding:8px 14px;border:1px solid var(--chat-border-color);border-radius:20px;outline:none;font-size:14px;background:var(--chat-primary-background-color);resize:none;height:36px;min-height:36px;word-wrap:break-word;white-space:pre-wrap;max-height:120px;overflow-y:hidden;font-family:inherit;line-height:18px;transition:height 0.4s ease-out}.message-input.multiline{min-height:36px;resize:none}.action-buttons{display:flex;gap:8px;align-items:flex-end}.send-animation{animation:sendAnimation 0.5s ease-in-out}@keyframes sendAnimation{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}.attachment-button,.send-button{width:36px;height:36px;border-radius:50%;border:none;background:#007AFF;color:var(--chat-tertiary-color);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.attachment-button{background:transparent;position:relative;box-shadow:0 0 0 1px var(--chat-border-color)}.attachment-button > svg{fill:var(--text-app-color)}.attachment-button:active{background:var(--chat-border-color)}.command-color{background:whitesmoke;font-size:11px;padding:0 10px}.command-color > div{color:lightslategray;> span{font-family:monospace;color:cornflowerblue}}.send-button{display:none;transform:scale(0.8);transition:opacity 0.2s, transform 0.2s}.send-button.visible{display:block;opacity:1;background-color:var(--chat-brand-button-color);transform:scale(1);transition:all 0.2s;box-shadow:0 0 0 1px var(--chat-border-color)}.send-button > svg{fill:var(--chat-border-color)}.send-button:active{background:var(--chat-border-color);& > svg:active{fill:var(--chat-brand-button-color)}}.send-button:disabled{opacity:0.5}.div-attachment-menu{position:absolute;bottom:100%;left:-140px;background:white;border-radius:12px;box-shadow:0 0.5px 5px 0 var(--chat-border-color);padding:8px 0;min-width:180px;transform-origin:bottom right;transform:scale(0);opacity:0;transition:all 0.2s;pointer-events:none;margin-bottom:8px}.div-attachment-menu.active{transform:scale(1);opacity:1;pointer-events:auto}.div-menu-item{padding:10px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;color:#333;font-size:14px}.div-menu-item:hover{background:var(--chat-secondary-background-color)}.div-menu-item svg{width:20px;height:20px}.recording-indicator{width:10px;height:10px;border-radius:50%;background:#ff0000;animation:pulse 1s infinite}@keyframes pulse{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}.loading-indicator{display:inline-block;width:20px;height:20px;position:relative;animation:spin 1s linear infinite}.loading-indicator::after,.loading-indicator::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:6px;height:6px;border-radius:50%;background-color:var(--chat-border-color)}.loading-indicator::before{transform:translate(-50%, -50%) translateX(-8px);animation:spin 1s linear infinite}.loading-indicator::after{transform:translate(-50%, -50%) translateX(8px);animation:spin 1s linear infinite 0.33s}@keyframes spin{0%{transform:translate(-50%, -50%) rotate(0deg)}100%{transform:translate(-50%, -50%) rotate(360deg)}}.error-message{color:#ff3b30;font-size:12px;margin-top:4px}@media (max-width:900px){.div-chat-container{position:fixed;width:100%;height:100%;top:0;border-radius:0}.div-messages-container{max-height:100%}.div-chat-box{bottom:5px;right:10px}.button-chat-trigger{width:60px;height:60px;border-radius:50px}.chat-header{border-radius:0}.chat-header span{position:absolute;top:10px;left:14px;font-size:24px}@media (max-height:570px){.div-chat-container{top:0}}}.taking-photo-button{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);background-color:#4CAF50;color:#fff;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:5px;box-shadow:0 0 10px rgba(0, 0, 0, 0.2)}.taking-photo-button svg{width:20px;height:20px;margin-right:10px}.taking-photo-button:hover{background-color:#3e8e41}.stop-recording-button{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);background-color:#f44336;color:#fff;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:5px;box-shadow:0 0 10px rgba(0, 0, 0, 0.2)}.stop-recording-button svg{width:20px;height:20px;margin-right:10px}.stop-recording-button:hover{background-color:#e91e63}.hidden{opacity:0}.hidden:hover{opacity:1}.camera-preview{width:100%;max-width:640px;height:auto;border-radius:8px}.preview-container{position:relative;margin:10px 0;width:100%;max-width:640px}.capture-button{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#007bff;color:var(--chat-tertiary-color);border:none;border-radius:20px;cursor:pointer}.close-preview{position:absolute;top:5px;right:5px;background:rgba(0, 0, 0, 0.5);color:var(--chat-tertiary-color);border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;display:flex;align-items:center;justify-content:center}.recording-container{display:flex;align-items:center;gap:10px;padding:8px;background:rgba(255, 0, 0, 0.1);border-radius:8px;margin:10px 0}.recording-indicator{width:12px;height:12px;background:red;border-radius:50%;animation:pulse 1s infinite}.recording-timer{font-family:monospace;font-size:14px}.stop-recording{background:none;border:none;cursor:pointer;font-size:18px;padding:4px}@keyframes pulse{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}@keyframes fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:0.1s fade-in ease}.appear{animation:0.1s appear ease-in}@keyframes appear{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`;
// document.head.appendChild(style);


(async () => {
  await Promise.all([
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "assets/js/marked.js";
      script.onload = resolve;
      document.head.appendChild(script);
    }),
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "assets/js/purify.js";
      script.onload = resolve;
      document.head.appendChild(script);
    }),
  ]);

  const container = document.createElement("div");
  container.className = "button";
  document.body.appendChild(container);

  function getUserId() {
    const userSession = JSON.parse(localStorage.getItem("userSession"));

    // Check if user ID exists and is within the 5-minute window
    if (
      userSession &&
      new Date().getTime() - userSession.timestamp < 5 * 60 * 1000
    ) {
      return userSession.userId;
    }

    // Generate a new user ID if expired or does not exist
    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(
      "userSession",
      JSON.stringify({
        userId: newUserId,
        timestamp: new Date().getTime(),
      })
    );

    return newUserId;
  }

  const userId = getUserId();

  async function fetchLastConversation(userId) {
    try {
      
      const response = await fetch( endpoint + '/lastConversation/' + `${userId}`);
      if (!response.ok) {
        throw new Error("Failed to retrieve last conversation");
      }
      const messagesData = await response.json();

      // Convert messagesData to match the format in `this.messages`
      return messagesData.map((msg) => ({
        text: msg.content,
        isUser: msg.user_type === "user",
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachment: msg.hasMedia
          ? { url: msg.fileUri, type: msg.mimeType }
          : null,
      }));
    } catch (error) {
      //console.error("Error fetching last conversation:", error);
      return [];
    }
  }

  Vue.createApp({
    template,
    data() {
      return {  
        isOpen: false,
        messages: [],
        newMessage: "",
        showMenu: false,
        attachmentPreviews: [],
        isRecording: false,
        mediaRecorder: null,
        recordedChunks: [],
        userId: userId,
        isLoading: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB max file size
        showOptionsIndex: null,
        inputFocused: false,
        showImageText: true,
        showAttachmentButton: true, // New boolean property
      };
    },

    async created() {
      // Load the last conversation when the app is created
      const lastConversation = await fetchLastConversation(this.userId);
      this.messages = lastConversation || [];
    },

    methods: {
      async resetSession() {
        localStorage.removeItem("userSession"); 
        this.messages = []; 
        this.showImageText = true; 
      },

      formatMessage(text) {
        text = text.replace(/\n+$/, ""); 
        text = DOMPurify.sanitize(text); 
        text = text.replace(/<br>/g, "<br>"); 
        return marked.parse(text);
      },

      // autoResize() {
      //   const messageInput = this.$refs.messageInput;
      //   messageInput.style.height = "auto"; 
      //   messageInput.style.height = messageInput.scrollHeight + "px"; 
      // },

      handleInput(e) {
        this.newMessage = e.target.innerText;
        if (e.inputType === "insertParagraph") e.preventDefault(); 
      },

      handleBlur(e) {
        if (!e.relatedTarget || !this.$el.contains(e.relatedTarget)) {
          setTimeout(() => {
            if (!this.newMessage.trim()) this.inputFocused = false;
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
            if (e.data.size > 0) this.recordedChunks.push(e.data);
          };

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: "audio/mp3" });
            if (blob.size > this.maxFileSize) {
              this.attachmentPreviews.push({
                error: "Audio recording exceeds 5MB limit",
              });
            } else {
              const url = URL.createObjectURL(blob);
              this.attachmentPreviews.push({
                url: url,
                type: "audio/mp3",
                file: new File([blob], "audio.mp3", { type: "audio/mp3" }),
              });
            }
            this.isRecording = false;
            stream.getTracks().forEach((track) => track.stop());
          };

          this.mediaRecorder.start();
          this.stopRecordingTimeout = setTimeout(() => {
            if (this.mediaRecorder && this.mediaRecorder.state === "recording")
              this.mediaRecorder.stop();
          }, 30000);
        } catch (err) {
          console.error("Error accessing microphone:", err);
        }
        this.showMenu = false;
      },

      async sendMessage() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showImageText = false; // Hide input

        const userInput = this.$refs.messageInput.innerText.trim();
        const attachments = [...this.attachmentPreviews];
        this.attachmentPreviews = [];

        if (attachments.length > 0 || userInput) {
          this.messages.push({
            text: userInput || "",
            isUser: true,
            attachment: attachments[0] || null,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        } else {
          this.isLoading = false;
          this.showImageText = true;
          return;
        }

        let attachmentCommand = "";
        try {
          let payload = { message: userInput, userId: this.userId };

          if (attachments[0] && attachments[0].file) {
            try {
              if (attachments[0].type.startsWith("image")) {
                payload.image = await this.toBase64(attachments[0].file);
                attachmentCommand = "  /image";
              } else if (attachments[0].type.startsWith("audio")) {
                payload.audio = await this.toBase64(attachments[0].file);
                attachmentCommand = "  /audio";
              } else if (attachments[0].type.startsWith("application/pdf")) {
                payload.pdf = await this.toBase64(attachments[0].file);
                attachmentCommand = "  /pdf";
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
              this.showImageText = true;
              return;
            }
          }

          console.log("Sending:", payload); // Log the payload to the console

          const response = await fetch(`${endpoint}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok)
            throw new Error(
              `Network response was not ok: ${response.statusText}`
            );
          const data = await response.json();

          this.messages.push({
            text: data.text,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });

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
          if (endpoint === "") {
            this.messages.push({
              text: `![assets/js/08e7ec0f84233b37ac26e920bc60ec57-2425886640.gif](assets/js/08e7ec0f84233b37ac26e920bc60ec57-2425886640.gif) 😔 Ups! No hay agentes disponibles.  \\\n\\\n Puedes programar una reunión a través de **[este enlace](https://routin.cloud/reunion)** para una mejor experiencia y obtener acceso gratuito. \\\n\\\n ¡Gracias por tu paciencia!`,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          } else {
            console.error("Error sending message:", error);
            this.messages.push({
              text: `![assets/js/228d269a2c536f7c19d5fc5a82f76659-1626091839.gif](assets/js/228d269a2c536f7c19d5fc5a82f76659-1626091839.gif) 😔 Ups! Parece que hay un problema con la conexión.  \\\n\\\n Puedes programar una reunión a través de **[este enlace](https://routin.cloud/reunion)** para una mejor experiencia y obtener acceso gratuito. \\\n\\\n ¡Gracias por tu paciencia!`,
              image: null,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          }
        } finally {
          this.$refs.messageInput.innerText = "";
          this.$refs.messageInput.style.maxHeight = "36px";
          if (attachmentCommand)
            this.$refs.messageInput.innerText = attachmentCommand;
          this.isLoading = false;
          this.showImageText = true;
        }

        this.$nextTick(() => {
          const container = this.$refs.msgs;
          container.scrollTop = container.scrollHeight;
        });
      },

      toggleOptions(index) {
        this.showOptionsIndex = this.showOptionsIndex === index ? null : index;
      },

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

const template = `<div class="div-chat-box">
    <button class="button-chat-trigger" @click="isOpen = !isOpen">
        <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" xml:space="preserve" width="23"
            height="23" style="display: block; margin: auto;">
            <path
                d="M16.099 0H6.902C3.098 0 0.004 3.095 0.004 6.898v5.365c0 3.804 3.095 6.898 6.898 6.898h0.683c2.67 0 5.181 1.04 7.069 2.928l0.719 0.719a0.653 0.653 0 0 0 1.11 -0.461v-3.198c3.627 -0.2 6.515 -3.213 6.515 -6.888V6.898C22.997 3.095 19.903 0 16.1 0" />
        </svg>
    </button>

    <div class="div-chat-container" v-show="isOpen" :class="{ 'fade-in': isOpen }">
        <div class="chat-header">

            <h1 @input="updateTitle" @blur="saveTitle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1.207 1.206"
                    xml:space="preserve" style="display: block; margin: auto;">
                    <path
                        d="M.604 0a.603.603 0 1 0-.002 1.206A.603.603 0 0 0 .604 0m.051.898a.051.051 0 0 1-.101 0V.563a.051.051 0 0 1 .101 0zm0-.52a.05.05 0 0 1-.051.051.05.05 0 0 1-.051-.051V.362c0-.028.023-.051.051-.051s.051.023.051.051z" />
                </svg>
                <small>Informes</small>
            </h1>
            </h1>
            <div class="close-button" @click="isOpen = !isOpen">
                <div class="hidden" @mouseover="hidden = false" @mouseout="hidden = true" @click="hidden = false">
                    <svg width="14" height="14" viewBox="0 0 0.42 0.42" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0.292 0.152 0.235 0.21l0.058 0.058a0.018 0.018 0 1 1 -0.025 0.025L0.21 0.235l-0.058 0.058a0.018 0.018 0 1 1 -0.025 -0.025L0.185 0.21 0.128 0.152a0.018 0.018 0 1 1 0.025 -0.025L0.21 0.185l0.058 -0.058a0.018 0.018 0 1 1 0.025 0.025" />
                    </svg>
                </div>
            </div>
        </div>

        <div v-if="messages.length === 0" class="div-info-header">
            Welcome to Routin Cloud 🖐️
        </div>

        <div class="timer-session" v-if="messages.length > 0" :class="{ 'active': messages.length > 0 }">
            <div @click="resetSession"> Want to start a fresh conversation? Click here! </div>
        </div>


        <div class="div-messages-container" ref="msgs">
            <div v-for="(msg, index) in messages" :class="['message', msg.isUser ? 'user' : 'bot']"
                @click="toggleOptions(index)">
                <div class="message-content">
                    <div v-html="formatMessage(msg.text)"></div>
                    <template v-if="msg.attachment">
                        <img v-if="msg.attachment.type.startsWith('image')" :src="msg.attachment.url">
                        <video v-else-if="msg.attachment.type.startsWith('video')" controls
                            :src="msg.attachment.url"></video>
                        <audio v-else-if="msg.attachment.type.startsWith('audio')" controls
                            :src="msg.attachment.url"></audio>
                    </template>
                    <div v-if="msg.error" class="error-message">{{ msg.error }}</div>
                    <div class="wrap-options" v-show="showOptionsIndex === index">
                        <div class="message-timestamp">{{ msg.timestamp }}</div>
                        <div class="message-id">Message ID: {{ index + 1 }}</div>
                    </div>
                </div>
            </div>
            <div v-if="isLoading" class="loading-indicator"></div>

        </div>
        <div class="commands">
            <div v-if="attachmentPreviews.length > 0 && attachmentPreviews[0].type.startsWith('image')"
                @click="sendMessage" class="command command-color">
                <div>*Ask about the attached image using the '<span>/image</span>' command. You can also combine it with
                    '<span class="monotype">/message</span>' to include the last message as context.</div>
            </div>
            <div v-if="attachmentPreviews.length > 0 && attachmentPreviews[0].type === 'application/pdf'"
                @click="sendMessage" class="command command-color">
                <div>*Ask about the attached PDF using the '<span>/pdf</span>' command.</div>
            </div>
            <div v-if="attachmentPreviews.length > 0 && attachmentPreviews[0].type.startsWith('audio')"
                @click="sendMessage" class="command command-color">
                <div>*Ask about the attached audio using the '<span>/audio</span>' command.</div>
            </div>
            <!--<div v-if="newMessage.trim() && !attachmentPreviews.length" @click="sendMessage" class="command command-color">
             *Ask about the last message using the '<span>/message</span>' or specific message using '<span>/message-[id] </span> command. 
      </div>-->

            <div class="input-area" ref="inputArea">
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
                    <div class="message-input" contenteditable="true" :style="{ opacity: showImageText ? 1 : 0 }"
                        @input="handleInput" @keydown.enter.exact.ctrl="sendMessage"
                        @keydown.enter.exact="sendMessage" @focus="inputFocused = true" @blur="handleBlur"
                        ref="messageInput" placeholder="Type a message...">
                    </div>

                    <div class="action-buttons">
                        <button v-if="showAttachmentButton" @click="toggleMenu" class="attachment-button">
                            <svg width="20" height="20" viewBox="0 0 0.6 0.6" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M.178.526A.17.17 0 0 1 .125.4V.15a.125.125 0 0 1 .25 0V.4a.075.075 0 0 1-.15 0V.2a.025.025 0 0 1 .05 0v.2a.025.025 0 0 0 .05 0V.15a.075.075 0 0 0-.15 0V.4a.125.125 0 0 0 .129.125.13.13 0 0 0 .121-.131V.1a.025.025 0 0 1 .05 0v.294a.18.18 0 0 1-.17.181H.3A.17.17 0 0 1 .178.526" />
                            </svg>
                            <div class="div-attachment-menu" :class="{ active: showMenu }" @mouseleave="showMenu = false">
                                <div class="div-menu-item" @click="handleAttachment">
                                    <input type="file" ref="fileInput" @change="onFileSelected" style="display:none"
                                        multiple>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                    </svg>
                                    Attachment
                                </div>

                                <div class="div-menu-item" @click="handleAudio">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                                    </svg>
                                    Audio
                                </div>
                            </div>
                        </button>
                        <button class="send-button"
                            :class="{ 'visible': newMessage.trim() || attachmentPreviews.length > 0 || isRecording }"
                            @click="sendMessage" :disabled="isLoading">
                            <svg width="20" height="20" viewBox="0 0 0.5 0.5" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0.275 0.425V0.135l0.082 0.082a0.025 0.025 0 1 0 0.035 -0.035l-0.125 -0.125a0.025 0.025 0 0 0 -0.035 0l-0.125 0.125a0.025 0.025 0 0 0 0 0.035 0.025 0.025 0 0 0 0.035 0L0.225 0.135V0.425a0.025 0.025 0 1 0 0.05 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
