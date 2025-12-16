const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let numeros = [];
let historial = [];
let intervalo = null;
let adminId = null;

function resetJuego() {
  numeros = Array.from({ length: 90 }, (_, i) => i + 1);
  historial = [];
}
resetJuego();

io.on("connection", socket => {
  // ADMIN REAL
  if (!adminId) {
    adminId = socket.id;
    socket.emit("admin", true);
  } else {
    socket.emit("admin", false);
  }

  // SINCRONIZAR ESTADO AL ENTRAR
  socket.emit("sync", {
    historial,
    ultimo: historial[historial.length - 1] || null
  });

  socket.on("auto", () => {
    if (socket.id !== adminId || intervalo) return;
    intervalo = setInterval(sacarNumero, 3000);
  });

  socket.on("pausa", () => {
    if (socket.id !== adminId) return;
    clearInterval(intervalo);
    intervalo = null;
  });

  socket.on("manual", () => {
    if (socket.id !== adminId) return;
    sacarNumero();
  });

  socket.on("reiniciar", () => {
    if (socket.id !== adminId) return;
    clearInterval(intervalo);
    intervalo = null;
    resetJuego();
    io.emit("reinicio");
  });

  socket.on("disconnect", () => {
    if (socket.id === adminId) adminId = null;
  });

  function sacarNumero() {
    if (numeros.length === 0) return;
    const i = Math.floor(Math.random() * numeros.length);
    const n = numeros.splice(i, 1)[0];
    historial.push(n);
    io.emit("numero", n);
  }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Bingo estable en puerto", PORT));