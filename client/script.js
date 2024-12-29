// Get references to DOM elements for local video, remote video, and buttons
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startCallButton = document.getElementById("startCall");
const endCallButton = document.getElementById("endCall");
const muteAudioButton = document.getElementById("muteAudio");
const muteVideoButton = document.getElementById("muteVideo");
const usernameInput = document.getElementById("username");
const nameInputContainer = document.getElementById("nameInputContainer");
const localLabel = document.getElementById("localLabel");
const remoteLabel = document.getElementById("remoteLabel");
const callTimer = document.getElementById("callTimer");

// Initialize socket connection to the server
const socket = io();

// Initialize variables for local and remote streams, peer connection, etc.
let localStream;
let remoteStream;
let peerConnection;
let username;
let callStartTime;
let timerInterval;

// Configure ICE servers (for NAT traversal)
const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },  // Google's public STUN server
    ],
};

// Event listener for the "Start Call" button
startCallButton.onclick = async () => {
    // Get the username entered by the user
    username = usernameInput.value.trim();

    // Check if the username is empty, and if so, show an alert
    if (!username) {
        alert("Please enter your name before starting the call.");
        return;
    }

    // Display the username on the local video label
    localLabel.textContent = username;

    // Hide the name input container once the user enters a name
    nameInputContainer.style.display = "none";

    // Emit the remote name to the server for broadcasting to the other peer
    socket.emit("remote-name", username);

    // Request access to the user's video and audio streams
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Set the local video element to show the local stream
    localVideo.srcObject = localStream;

    // Create a new RTCPeerConnection for the WebRTC connection
    peerConnection = new RTCPeerConnection(servers);

    // Add the local media tracks (audio/video) to the peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Event listener for receiving media tracks from the remote peer
    peerConnection.ontrack = (event) => {
        // If this is the first remote track, create a new media stream
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        // Add the received remote track to the remote media stream
        remoteStream.addTrack(event.track);
    };

    // Event listener for ICE candidate events (used for peer-to-peer communication)
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Emit the ICE candidate to the server for the other peer to receive
            socket.emit("ice-candidate", event.candidate);
        }
    };

    // Create an offer to initiate the WebRTC connection
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Send the offer to the other peer via the signaling server
    socket.emit("offer", offer);

    // Start the call timer
    startCallTimer();
};

// Event listener for receiving an offer from the remote peer
socket.on("offer", async (offer) => {
    // If there is no existing peer connection, create one
    if (!peerConnection) {
        peerConnection = new RTCPeerConnection(servers);

        // Event listener for receiving media tracks from the remote peer
        peerConnection.ontrack = (event) => {
            // If this is the first remote track, create a new media stream
            if (!remoteStream) {
                remoteStream = new MediaStream();
                remoteVideo.srcObject = remoteStream;
            }
            // Add the received remote track to the remote media stream
            remoteStream.addTrack(event.track);
        };

        // Event listener for ICE candidate events (used for peer-to-peer communication)
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Emit the ICE candidate to the server for the other peer to receive
                socket.emit("ice-candidate", event.candidate);
            }
        };

        // Add local media tracks (audio/video) to the peer connection
        localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    }

    // Set the received offer as the remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Create an answer in response to the offer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send the answer to the remote peer via the signaling server
    socket.emit("answer", answer);
});

// Event listener for receiving an answer from the remote peer
socket.on("answer", (answer) => {
    // Set the received answer as the remote description
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Event listener for receiving ICE candidates from the remote peer
socket.on("ice-candidate", (candidate) => {
    // Add the received ICE candidate to the peer connection
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Event listener for receiving the remote user's name
socket.on("remote-name", (name) => {
    // Display the remote user's name on the remote video label
    remoteLabel.textContent = name;
});

// Event listener for the "Mute Audio" button
muteAudioButton.onclick = () => {
    // Toggle the audio track enabled state (mute/unmute)
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        muteAudioButton.textContent = audioTrack.enabled ? "Mute Audio" : "Unmute Audio";
    }
};

// Event listener for the "Mute Video" button
muteVideoButton.onclick = () => {
    // Toggle the video track enabled state (mute/unmute)
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        muteVideoButton.textContent = videoTrack.enabled ? "Mute Video" : "Unmute Video";
    }
};

// Event listener for the "End Call" button
endCallButton.onclick = () => {
    // Close the peer connection and reset all related variables
    peerConnection.close();
    peerConnection = null;
    remoteVideo.srcObject = null;
    remoteStream = null;
    localLabel.textContent = "";
    remoteLabel.textContent = "";
    
    // Show the name input container again
    nameInputContainer.style.display = "block";

    // Stop the call timer
    stopCallTimer();
};

// Function to start the call duration timer
function startCallTimer() {
    callStartTime = Date.now();  // Store the start time of the call
    timerInterval = setInterval(() => {
        // Calculate the elapsed time
        const elapsedTime = Date.now() - callStartTime;
        const minutes = Math.floor(elapsedTime / 60000);  // Get the minutes
        const seconds = Math.floor((elapsedTime % 60000) / 1000);  // Get the seconds

        // Update the call timer text
        callTimer.textContent = `Call Duration: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);  // Update every second
}

// Function to stop the call duration timer
function stopCallTimer() {
    clearInterval(timerInterval);  // Stop the timer
    callTimer.textContent = "Call Duration: 00:00";  // Reset the timer text
}