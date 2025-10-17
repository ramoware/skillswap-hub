import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const SocketHandler = (req: unknown, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Join a session room
      socket.on('join-session', (sessionId: string) => {
        socket.join(`session-${sessionId}`);
        console.log(`User ${socket.id} joined session ${sessionId}`);
        
        // Notify others in the session
        socket.to(`session-${sessionId}`).emit('user-joined', {
          userId: socket.id,
          message: 'A new participant joined the session'
        });
      });

      // Leave a session room
      socket.on('leave-session', (sessionId: string) => {
        socket.leave(`session-${sessionId}`);
        console.log(`User ${socket.id} left session ${sessionId}`);
        
        // Notify others in the session
        socket.to(`session-${sessionId}`).emit('user-left', {
          userId: socket.id,
          message: 'A participant left the session'
        });
      });

      // Handle chat messages
      socket.on('send-message', (data: { sessionId: string; message: string; user: string }) => {
        socket.to(`session-${data.sessionId}`).emit('receive-message', {
          id: Date.now(),
          message: data.message,
          user: data.user,
          timestamp: new Date().toISOString()
        });
      });

      // Handle screen sharing
      socket.on('start-screen-share', (sessionId: string) => {
        socket.to(`session-${sessionId}`).emit('screen-share-started', {
          userId: socket.id,
          message: 'Started screen sharing'
        });
      });

      socket.on('stop-screen-share', (sessionId: string) => {
        socket.to(`session-${sessionId}`).emit('screen-share-stopped', {
          userId: socket.id,
          message: 'Stopped screen sharing'
        });
      });

      // Handle session status updates
      socket.on('update-session-status', (data: { sessionId: string; status: string }) => {
        socket.to(`session-${data.sessionId}`).emit('session-status-updated', {
          sessionId: data.sessionId,
          status: data.status,
          updatedBy: socket.id
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  res.end();
};
