import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { 
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8
  });
  
  const PORT = 3000;

  // Real-time server state
  let historicalAlarms: any[] = [
    { id: '1', level: 'red', message: 'Invasão detectada no setor sul', timestamp: '22/04/2026 14:30' },
    { id: '2', level: 'yellow', message: 'Movimentação suspeita porta principal', timestamp: '21/04/2026 09:15' },
    { id: '3', level: 'green', message: 'Teste de sistema - OK', timestamp: '18/04/2026 11:00' },
  ];
  let activeAlarm: any = null;
  let sharedFiles: any[] = [];
  let groupMessages: any[] = [
    { id: 'm1', groupId: 'g1', senderId: '2', text: 'Bom dia pessoal!', timestamp: '08:00' },
    { id: 'm2', groupId: 'g1', senderId: '3', text: 'Bom dia. Os relatórios já estão no servidor.', timestamp: '08:05' },
  ];

  // Socket connection handler
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Send current state to newly connected client
    socket.emit("initial-state", {
      historicalAlarms,
      activeAlarm,
      sharedFiles,
      groupMessages
    });

    // Handle alarm triggers
    socket.on("trigger-alarm", (alarm) => {
      console.log("Alarm triggered:", alarm);
      // Update global active alarm
      activeAlarm = {
        level: alarm.level,
        sound: alarm.sound,
        message: alarm.message
      };
      
      // Add to history if there is a level
      if (alarm.level) {
        const newAlarm = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          level: alarm.level,
          message: alarm.message || '',
          timestamp: new Date().toLocaleString('pt-BR')
        };
        historicalAlarms = [newAlarm, ...historicalAlarms];
      }

      // Broadcast to all clients
      io.emit("alarm-triggered", { activeAlarm, historicalAlarms });
    });

    // Handle clearing history
    socket.on("clear-history", () => {
      historicalAlarms = [];
      io.emit("history-cleared");
    });
    
    // Handle clearing active alarm (Ciente/Aceitar)
    socket.on("clear-active-alarm", () => {
      activeAlarm = null;
      io.emit("active-alarm-cleared");
    });

    // File Sharing
    socket.on("share-file", (file) => {
      const newFile = {
        ...file,
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      sharedFiles = [newFile, ...sharedFiles];
      io.emit("file-shared", sharedFiles);
    });

    socket.on("delete-file", (fileId) => {
      sharedFiles = sharedFiles.filter(f => f.id !== fileId);
      io.emit("file-deleted", sharedFiles);
    });

    // Group Chat
    socket.on("send-group-message", (message) => {
      groupMessages.push(message);
      io.emit("group-message", message);
    });

    // WebRTC Signaling
    socket.on("join-call", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined call room ${roomId}`);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("initiate-call", (data) => {
      // Broadcast to all other clients
      socket.broadcast.emit("incoming-call", { from: socket.id, type: data.type });
    });

    socket.on("accept-call", () => {
      // Broadcast to all other clients to stop ringing
      socket.broadcast.emit("call-picked-up");
    });

    socket.on("cancel-call", () => {
      // Broadcast to all other clients
      socket.broadcast.emit("call-cancelled");
    });

    socket.on("decline-call", () => {
      // Usually would notify the caller, but simple implementation for now
    });

    socket.on("signal", ({ to, signal }) => {
      console.log(`Signaling from ${socket.id} to ${to}`);
      io.to(to).emit("signal", { from: socket.id, signal });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      socket.broadcast.emit("user-disconnected", socket.id);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
