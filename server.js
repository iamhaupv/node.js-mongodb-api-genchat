require('dotenv').config({ path: '.env' });
const express = require("express");
const app = express();
const port = process.env.PORT || 2002;
const {
  userRouter,
  messengerRouter,
  roomRouter,
} = require("./src/routes/index");
const connect = require("./src/databases/mongodb");
const checkToken = require("./src/authentication/auththentication");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const cors = require("cors");
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 20000, // Thời gian tối đa 20 giây để khôi phục kết nối
    skipMiddlewares: true, // Bỏ qua các middleware khi khôi phục
  },
});
// CORS middleware
app.use(cors({ origin: true }));
// check token
// app.use(checkToken);
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//
app.use(express.static("./src"));
// url users
app.use("/users", userRouter);
// url messengers
app.use("/messengers", messengerRouter);
// url rooms
app.use("/rooms", roomRouter);

// app.listen(port, async () => {
//   await connect();
//   console.log(`Example app on for port group ${port}`);
// });
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
// io.on('connection', (socket) => {
//   socket.on('chat message', (msg) => {
//     console.log('message: ' + msg);
//   });
// });
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(3000, async () => {
  await connect();
  console.log("server running at http://localhost:3000");
});
