const socket = io({
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

const bola = document.getElementById("bola");
const historialDiv = document.getElementById("historial");

let soyAdmin = false;

socket.on("admin", val => {
  soyAdmin = val;
  if (!soyAdmin) {
    document.querySelectorAll(".botones button").forEach(b => b.style.display = "none");
  }
});

socket.on("sync", data => {
  historialDiv.innerHTML = "";
  data.historial.forEach(agregar);
  if (data.ultimo) bola.textContent = data.ultimo;
});

socket.on("numero", n => {
  bola.textContent = n;
  hablar(n);
  agregar(n);
});

socket.on("reinicio", () => {
  bola.textContent = "--";
  historialDiv.innerHTML = "";
});

function agregar(n) {
  const b = document.createElement("div");
  b.className = "bola-mini";
  b.textContent = n;
  historialDiv.prepend(b);
}

function hablar(n) {
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(`Número ${n}`));
}

function auto() { socket.emit("auto"); }
function pausa() { socket.emit("pausa"); }
function manual() { socket.emit("manual"); }
function reiniciar() { socket.emit("reiniciar"); }