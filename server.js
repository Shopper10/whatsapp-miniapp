const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const salas = {};

function nuevaSala(id) {
  salas[id] = {
    numeros: [...Array(90).keys()].map(i => i + 1),
    salidos: [],
    jugadores: {}
  };
}

io.on("connection", socket => {

  socket.on("entrarSala", sala => {
    socket.join(sala);
    if (!salas[sala]) nuevaSala(sala);
    socket.emit("estado", salas[sala]);
  });

  socket.on("sacarNumero", sala => {
    const s = salas[sala];
    if (!s || s.numeros.length === 0) return;

    const i = Math.floor(Math.random() * s.numeros.length);
    const n = s.numeros.splice(i, 1)[0];
    s.salidos.push(n);

    io.to(sala).emit("numero", n);
  });

  socket.on("reiniciar", sala => {
    nuevaSala(sala);
    io.to(sala).emit("estado", salas[sala]);
  });

  socket.on("cantarBingo", data => {
    io.to(data.sala).emit("bingoCantado", data.jugador);
  });

});

http.listen(process.env.PORT || 3000, () => {
  console.log("Servidor Bingo activo");
});
