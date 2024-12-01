import { app, server } from './socket/socket.js'; // Import the app, io, and server from socket.js

// Define the port for the server
const PORT = process.env.PORT || 5000;

// Start the Express server
server.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});

// You can add other global middlewares or routes for additional functionality if necessary
app.get('/', (req, res) => {
  res.send("Welcome to the Battle Arena Server!");
});