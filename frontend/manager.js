export class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.connect();
  }

  // Make websocket connection
  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    this.socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    this.socket.onerror = (error) => {
      console.log("WebSocket error: ", error);
    };

    this.socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("WebSocket message received: ", data);
    };
  }

  // Send events to server
  send(event) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.log("WebSocket is not open. Ready state is:", this.socket.readyState);
    }
  }

  // close websocket connection
  close() {
    if (this.socket) {
      this.socket.close();
      console.log("Closed connection!")
    }
  }
}
