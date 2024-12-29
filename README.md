
# WebRTC Video Chat Application

A simple WebRTC-based video chat application that allows users to establish peer-to-peer connections and exchange audio/video streams in real time.

## Features

- **Real-Time Communication:** Peer-to-peer video/audio chat using WebRTC.
- **Custom Usernames:** Display custom usernames during the call.
- **NAT Traversal:** Uses STUN servers for establishing connections across networks.
- **Intuitive Controls:**
  - Mute/Unmute audio and video.
  - End call functionality.
- **Call Timer:** Displays call duration in real-time.
- **Cross-Browser Compatibility:** Works on major browsers like Chrome, Firefox, and Safari.

---

## Project Structure
webrtc-app/ │ ├── server/ │ ├── index.js # Server-side code using Node.js and Socket.IO │ ├── package.json # Node.js project metadata │ ├── client/ │ ├── index.html # Main client HTML file │ ├── style.css # Styling for the application │ ├── script.js # Client-side JavaScript │ ├── public/ # Optional directory for additional static assets └── .gitignore # Ignored files for Git version control


## Configuration

### STUN/TURN Servers

The application uses the following STUN server for NAT traversal:

```javascript
const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
```

---

## Installation and Setup

Follow these steps to run the application locally:

### Prerequisites

- Node.js installed on your machine.
- A web browser that supports WebRTC (e.g., Chrome, Firefox, or Safari).

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/bhavin1912/WebRTC-video-chat-application.git
    cd WebRTC-video-chat-application
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    npm start
    ```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000) to start using the WebRTC video chat.

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Socket.IO
- **WebRTC:** Peer-to-peer video/audio communication
- **STUN Servers:** For NAT traversal

---

## Acknowledgments

- MDN WebRTC Documentation
- Socket.IO Documentation
- Node.js Documentation
