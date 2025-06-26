const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));
app.use(express.json());
app.use(fileUpload());

// Make io available to routes
app.set('io', io);

const documentsRouter = require('./routes/documents');
app.use('/api/documents', documentsRouter);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});