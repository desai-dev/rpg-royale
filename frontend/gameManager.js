export class GameManager {
  constructor() {
    const canvas = document.getElementById("myCanvas");
    this.canvas = canvas.getContext("2d");
    this.modal = document.getElementById('gameModal');
    this.modalOverlay = document.getElementById('modalOverlay');
  }

  routeCanvasEvent(event) {
    console.log("WebSocket message received: ", event);
    if (event.type == "GAME_START") {
      this.handleGameStart(event.payload);
    } else if (event.type == "PARTY_CREATED") {
      this.handlePartyCreated(event.payload);
    } else {
      console.log("Not a game start event");
    }
  }

  handleGameStart(initialSettings) {
    this.modal.style.display = 'none';
    this.modalOverlay.style.display = 'none';
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

  handlePartyCreated(payload) {
    const partyID = payload.partyID;
    var partyCodeElement = document.getElementById("party-code");
    partyCodeElement.style.visibility = 'visible';
    partyCodeElement.textContent = 'PARTY CODE: ' + partyID;
  }


}