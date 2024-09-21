export class CanvasManager {
  constructor(canvasCtx) {
    this.canvas = canvasCtx
  }

  routeCanvasEvent(event) {
    console.log("WebSocket message received: ", event);
    if (event.type == "GAME_START") {
      this.handleGameStart(event.payload);
    } else {
      console.log("Not a game start event");
    }
  }

  handleGameStart(initialSettings) {
    const players = initialSettings.players;
    const curPlayerId = initialSettings.id;

    for (const player of players) {
      var x_pos = player.position.x
      var y_pos = player.position.y

      console.log("x_pos: " + x_pos + " y_pos: " + y_pos);

      this.canvas.beginPath();
      this.canvas.rect(x_pos, y_pos, 10, 10);
      if (curPlayerId == player.playerId) {
        this.canvas.fillStyle = "#0000FF";
      } else {
        this.canvas.fillStyle = "#FF0000";
      }
      this.canvas.fill();
      this.canvas.closePath();
    }
  }
}