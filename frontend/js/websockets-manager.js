// websocket-manager.js
let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Add this flag to track connection status
let isIntentionalClose = false;

function initWebSocket() {
  // Reset intentional close flag
  isIntentionalClose = false;
  
  // Close existing connection if any
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    isIntentionalClose = true; // Mark this as intentional
    socket.close();
  }
  
  try {
    console.log("Initializing user WebSocket connection...");
    
    // Use config for WebSocket URL
    const wsUrl = window.WS_URL || 'ws://localhost:4000/ws/connect';
    console.log("Connecting to:", wsUrl);
    
    // Connect to the WebSocket endpoint - cookie auth will handle identification
    socket = new WebSocket(wsUrl);
    
    // Add connection timeout to detect stalled connections
    const connectionTimeout = setTimeout(() => {
      if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.error("WebSocket connection attempt timed out");
        socket.close();
      }
    }, 10000); // 10 second timeout
    
    socket.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log("WebSocket connection opened successfully!");
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Wait a bit before sending first message to ensure connection is fully established
      setTimeout(() => {
        try {
          if (socket && socket.readyState === WebSocket.OPEN) {
            // console.log("Sending hello message");
            // Send a "hello" message to identify as a regular user
            socket.send(JSON.stringify({
              type: 'hello',
              clientType: 'user',
              timestamp: new Date().toISOString()
            }));
            
            // Start heartbeat
            startHeartbeat();
          } else {
            // console.warn("Socket closed before we could send hello message");
          }
        } catch (err) {
          console.error("Error sending initial hello message:", err);
        }
      }, 500);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("WebSocket message received:", data);
        
        // Dispatch custom event for other components to listen to
        document.dispatchEvent(new CustomEvent('websocket-message', {
          detail: data
        }));
        
        // Handle specific message types
        if (data.type === "welcome") {
          // console.log("WebSocket welcome message:", data);
        } else if (data.type === "heartbeat") {
          // console.log("Heartbeat received from server");
        } else if (data.type === "error") {
          console.error("WebSocket error from server:", data.message);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    socket.onclose = (event) => {
      clearTimeout(connectionTimeout);
      console.log(`WebSocket connection closed: Code=${event.code}, Reason=${event.reason || 'None provided'}, Clean=${event.wasClean}`);
      stopHeartbeat();
      
      if (isIntentionalClose) {
        console.log("WebSocket closed intentionally - not reconnecting");
        return;
      }
      
      // Try to reconnect if we haven't exceeded max attempts
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        
        // Exponential backoff: wait longer between each attempt
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        
        console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${timeout/1000} seconds...`);
        setTimeout(initWebSocket, timeout);
      } else {
        console.log("Maximum reconnection attempts reached. Please refresh the page.");
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return socket;
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
    return null;
  }
}

// Function to send a message through the WebSocket
function sendMessage(type, data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket not connected");
    return false;
  }
  
  try {
    const message = {
      type,
      ...data,
      timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error("Error sending WebSocket message:", error);
    return false;
  }
}

// Update the closeWebSocket function
function closeWebSocket() {
  if (socket) {
    console.log("Explicitly closing WebSocket connection");
    isIntentionalClose = true; // Mark as intentional
    
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: 'disconnect' }));
      } catch (e) {
        console.warn("Could not send disconnect message:", e);
      }
    }
    
    socket.onclose = null; // Remove reconnect handler
    socket.close();
    socket = null;
  }
}

// Add heartbeat functions to keep the connection alive
let heartbeatInterval = null;

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }, 30000); // Send heartbeat every 30 seconds
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Clean disconnect when page is unloaded
window.addEventListener('beforeunload', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Send a clean disconnect message
    socket.send(JSON.stringify({ type: 'disconnect' }));
    socket.close();
  }
});

// This ensures WebSocket is initialized on all user pages
// You don't need to modify this - it works as expected
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize WebSocket if we're not on an admin page and there's a cookie
  if (window.location.pathname.indexOf('admin') === -1) {
    // Check if we likely have auth
    const hasAuthCookie = document.cookie.indexOf('auth_token') >= 0;
    
    if (hasAuthCookie) {
      console.log("Auth cookie found, initializing WebSocket");
      initWebSocket();
    } else {
      // console.log("No auth cookie found, skipping WebSocket initialization");
    }
  }
});

// Export functions
window.initWebSocket = initWebSocket;
window.sendWSMessage = sendMessage;
window.closeWebSocket = closeWebSocket;