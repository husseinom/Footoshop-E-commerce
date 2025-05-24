// websocketRouter.ts
import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { validateJWT, verifyJWT } from "../middleware/validate.ts";

interface WebSocketUser {
  ws: WebSocket;
  userId: string;
  username: string;
  isAdmin: boolean;
  connectionTime: Date;     // When the user connected
  lastActivity: Date;       // Last activity timestamp
}

export const connectedUsers = new Map<string, WebSocketUser>();

export function createWebSocketRouter() {
  const router = new Router();

  // Single WebSocket endpoint that works with validateJWT middleware
  router.get("/ws/connect", async (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501, "Not upgradable");
      return;
    }

    // Get token from URL params or cookies
    const token = ctx.request.url.searchParams.get("token") || 
                 await ctx.cookies.get("auth_token");
                 
    console.log("WebSocket connection attempt with token:", token ? "exists" : "missing");

    if (!token) {
      ctx.throw(401, "Token required");
      return;
    }

    try {
      // Verify the token directly
      const payload = await verifyJWT(token);
      if (!payload) {
        ctx.throw(401, "Invalid token");
        return;
      }

      console.log("WebSocket auth successful:", payload);
      
      // Upgrade the connection to WebSocket
      const ws = ctx.upgrade();
      console.log("WebSocket connection established");
      
      // Format user data from payload
      const userData = {
        userId: String(payload.id || payload.userId),
        username: payload.name || payload.username,
        isAdmin: payload.role === 'admin' || payload.isAdmin === true
      };
      
      console.log(`WebSocket connection for ${userData.username} (${userData.userId}), isAdmin: ${userData.isAdmin}`);
      
      // Handle based on admin status
      if (userData.isAdmin) {
        handleAdminConnection(ws, userData);
      } else {
        handleNewConnection(ws, userData);
      }
      
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      ctx.throw(401, "Authentication failed");
    }
  });

  return router;
}

// Updated to use the correct parameter structure
function handleNewConnection(ws: WebSocket, user: { userId: string, username: string, isAdmin: boolean }) {
  console.log(`Handling new connection: ${user.username} (${user.userId})`);
  
  connectedUsers.set(user.userId, { 
    ws, 
    userId: user.userId, 
    username: user.username, 
    isAdmin: user.isAdmin,
    connectionTime: new Date(),
    lastActivity: new Date()
  });

  // Send welcome message
  if(ws.readyState === WebSocket.OPEN){
    ws.send(JSON.stringify({
    type: "welcome",
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin
    }));
  }
  

  // Notify admins
  broadcastToAdmins({
    type: "user_connected",
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin,
    timestamp: new Date().toISOString()
  });

  // Setup message handler
  ws.onmessage = (event) => {
    handleClientMessage(ws, user.userId, event.data);
  };

  ws.onclose = () => {
    console.log(`User disconnected: ${user.username} (${user.userId})`);
    connectedUsers.delete(user.userId);
    broadcastToAdmins({
      type: "user_disconnected",
      userId: user.userId,
      timestamp: new Date().toISOString()
    });
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error for ${user.username}:`, error);
  };
}

// Updated to use the correct parameter structure
function handleAdminConnection(ws: WebSocket, user: { userId: string, username: string, isAdmin: boolean }) {
  console.log(`Handling admin connection: ${user.username} (${user.userId})`);

  // Add to connected users with timestamp
  connectedUsers.set(user.userId, { 
    ws, 
    userId: user.userId, 
    username: user.username, 
    isAdmin: true,
    connectionTime: new Date(),
    lastActivity: new Date()
  });

  // Send welcome message - NO NEED TO SEND CONNECTED USERS LIST YET
  if(ws.readyState === WebSocket.OPEN){ 
    ws.send(JSON.stringify({
    type: "welcome",
    message: "Connected to admin WebSocket",
    userId: user.userId,
    username: user.username
  }));
  }

  // Set up event handlers
  ws.onopen = () => {
    console.log(`Admin WebSocket fully open for ${user.username}`);
    // NOW it's safe to send the connected users list
    sendConnectedUsersList(ws);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log(`Admin message from ${user.username}:`, message);
      
      if (message.type === "get_users") {
        // Check if the connection is open before sending
        if (ws.readyState === WebSocket.OPEN) {
          sendConnectedUsersList(ws);
        } else {
          console.log("Cannot send user list - connection not open");
        }
      }
      // Handle other admin message types
    } catch (error) {
      console.error(`Error handling admin message from ${user.username}:`, error);
    }
  };

  ws.onclose = () => {
    console.log(`Admin disconnected: ${user.username} (${user.userId})`);
    connectedUsers.delete(user.userId);
  };
  
  ws.onerror = (error) => {
    console.error(`WebSocket error for admin ${user.username}:`, error);
  };
}

// Also update the sendConnectedUsersList function to check readyState
function sendConnectedUsersList(ws: WebSocket) {
  // Check if the WebSocket is open before attempting to send
  if (ws.readyState !== WebSocket.OPEN) {
    console.log("Cannot send connected users list - connection not in OPEN state");
    return;
  }

  const usersList = Array.from(connectedUsers.values())
    .map(user => ({
      userId: user.userId,
      username: user.username,
      isAdmin: user.isAdmin
    }));

  console.log(`Sending connected users list (${usersList.length} users)`);
  
  try {
    ws.send(JSON.stringify({
      type: "connected_users_update",
      users: usersList
    }));
  } catch (error) {
    console.error("Error sending connected users list:", error);
  }
}

function handleClientMessage(ws: WebSocket, userId: string, data: string) {
  try {
    const message = JSON.parse(data);
    console.log(`Message from client ${userId}:`, message);
    
    switch (message.type) {
      case "echo":
        ws.send(JSON.stringify({
          type: "echo_reply",
          message: message.text,
          timestamp: new Date().toISOString()
        }));
        break;
        
      // Add other message handlers here
      default:
        console.log(`Unhandled message type from client: ${message.type}`);
    }
    
  } catch (error) {
    console.error("Error handling client message:", error);
    ws.send(JSON.stringify({
      type: "error",
      message: "Invalid message format"
    }));
  }
}

export function broadcastToAdmins(message: object) {
  const messageStr = JSON.stringify(message);
  let adminCount = 0;
  
  for (const user of connectedUsers.values()) {
    if (user.isAdmin && user.ws.readyState === WebSocket.OPEN) {
      try {
        user.ws.send(messageStr);
        adminCount++;
      } catch (error) {
        console.error(`Error sending to admin ${user.username}:`, error);
      }
    }
  }
  
  if (adminCount > 0) {
    console.log(`Broadcasted message to ${adminCount} admins:`, message);
  }
}

// Set up heartbeat interval to keep connections alive
function setupHeartbeat() {
  setInterval(() => {
    for (const [userId, user] of connectedUsers.entries()) {
      try {
        // Check if connection is still open
        if (user.ws.readyState === WebSocket.OPEN) {
          // Send heartbeat
          user.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }));
          
          // Check for inactivity (optional)
          const inactiveTime = Date.now() - user.lastActivity.getTime();
          if (inactiveTime > 30 * 60 * 1000) { // 30 minutes of inactivity
            console.log(`Closing inactive connection for ${user.username}`);
            user.ws.close(1000, "Inactive connection");
            connectedUsers.delete(userId);
          }
        } else {
          // Connection no longer open
          console.log(`Removing stale connection for ${user.username}`);
          connectedUsers.delete(userId);
        }
      } catch (error) {
        console.error(`Error in heartbeat for ${user.username}:`, error);
        // Clean up broken connection
        connectedUsers.delete(userId);
      }
    }
  }, 30000); // Send heartbeat every 30 seconds
}

// Call this in your initialization
setupHeartbeat();