// Terminal integration with xterm.js
const term = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Courier New, monospace',
  theme: {
    background: '#1a1a1a',
    foreground: '#eee',
  }
});

term.open(document.getElementById("term"));

const socket = new WebSocket(`ws://${location.host}/terminal`);

socket.onmessage = (e) => term.write(e.data);
term.onData((data) => socket.send(data));

socket.onclose = () => {
  term.write('\r\n\x1b[31mConnection closed\x1b[0m\r\n');
};

socket.onerror = (error) => {
  term.write('\r\n\x1b[31mWebSocket error\x1b[0m\r\n');
};
