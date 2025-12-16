const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let sala = {
  admin: null,
  numeros: [],
  sacados: [],
  jugadores: {}
};

function iniciarJuego() {
  sala.numeros = Array.from({ length: 90 }, (_, i) => i + 1);
  sala.sacados = [];
  sala.jugadores = {};
  sala.admin = null;
}

iniciarJuego();

function sacarNumero() {
  if (sala.numeros.length === 0) return null;
  const i = Math.floor(Math.random() * sala.numeros.length);
  return sala.numeros.splice(i, 1)[0];
}

io.on("connection", socket => {

  // ADMIN
  if (!sala.admin) {
    sala.admin = socket.id;
    socket.emit("admin", true);
  } else {
    socket.emit("admin", false);
  }

  // Crear cartón (15 números)
  const carton = [];
  while (carton.length < 15) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!carton.includes(n)) carton.push(n);
  }

  sala.jugadores[socket.id] = carton;

  socket.emit("carton", carton);
  socket.emit("estado", sala.sacados);

  socket.on("sacar", () => {
    if (socket.id !== sala.admin) return;

    const num = sacarNumero();
    if (!num) return;

    sala.sacados.push(num);
    io.emit("numero", num);
  });

  socket.on("disconnect", () => {
    delete sala.jugadores[socket.id];
    if (socket.id === sala.admin) {
      iniciarJuego();
      io.emit("reset");
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Bingo PRO activo");
});