var config = {
  apiKey: "AIzaSyAbJ0qDwRJOpEvUT1VhbZNHhzM6uD45QgE",
  authDomain: "first-firebase-e4231.firebaseapp.com",
  databaseURL: "https://first-firebase-e4231.firebaseio.com",
  projectId: "first-firebase-e4231",
  storageBucket: "first-firebase-e4231.appspot.com",
  messagingSenderId: "548914209161"
};
firebase.initializeApp(config);
var database = firebase.database();
var connectionsRef = database.ref("/connections");
var gameTurnRef = database.ref("playerTurn");
var connectedRef = database.ref(".info/connected");
var gameLog = $("#game-log");
var playerNum = 0;
var playerTurn = 0;
var player1Controls = $("#player-1-controls");
var player2Controls = $("#player-2-controls");
var player1ChoiceRef = database.ref("player1Choice");
var player2ChoiceRef = database.ref("player2Choice");
var player1Choice = "";
var player2Choice = "";

// When the client's connection state changes...
connectedRef.on("value", function(snap) {
  // If they are connected..
  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snapshot) {
  // Display the viewer count in the html.
  if (snapshot.numChildren() < 2) {
    playerNum = 1;
    $("#game-log").append("<p>Waiting for player 2 to connect...</p>");
  } else {
    if (playerNum === 0) {
      playerNum = 2;
    }
    $("#game-log").append("<p>The game is ready to begin!</p>");
    gameTurnRef.set(1);
  }
});

gameTurnRef.on("value", function(snapshot) {
  playerTurn = snapshot.val();
  if (playerTurn === 3) {
    // EVALUATE WIN/LOSS LOGIC HERE
    $("#player-1-controls").css("display", "none");
    $("#player-2-controls").css("display", "none");
    evalWinner();
  } else if (playerTurn > 0) {
    $("#game-log").append("<p>Player " + playerTurn + "'s turn!</p>");
    if (playerTurn === 1) {
      $("#player-2-controls").css("display", "none");
      if (playerNum === playerTurn) {
        $("#player-1-controls").css("display", "block");
      }
    } else if (playerTurn === 2) {
      $("#player-1-controls").css("display", "none");
      if (playerNum === playerTurn) {
        $("#player-2-controls").css("display", "block");
      }
    } else if (playerTurn === 3) {
    }
  }
});

player1ChoiceRef.on("value", function(snapshot) {
  player1Choice = snapshot.val();
});
player2ChoiceRef.on("value", function(snapshot) {
  player2Choice = snapshot.val();
});

function evalWinner() {
  if (player1Choice === player2Choice) {
    // draw
    $("#game-log").append(
      "<p>Draw! Both players chose " + player1Choice + "!</p>"
    );
  } else if (
    (player1Choice === "rock" && player2Choice === "scissors") ||
    (player1Choice === "scissors" && player2Choice === "paper") ||
    (player1Choice === "paper" && player2Choice === "rock")
  ) {
    //player 1 win
    $("#game-log").append("<p>Player 1 wins with " + player1Choice + "!</p>");
  } else {
    // player 2 win
    $("#game-log").append("<p>Player 2 wins with " + player2Choice + "!</p>");
  }
  gameTurnRef.set(1);
}

$(document).ready(function() {
  $(".control-button").on("click", function() {
    var choice = $(this).attr("data-control");

    if (playerTurn === playerNum) {
      if (
        playerTurn === 1 &&
        $(this)
          .parent()
          .hasClass("p-1")
      ) {
        console.log("Player 1 picked " + choice);
        player1ChoiceRef.set(choice);
        gameTurnRef.set(2);
      } else if (
        playerTurn === 2 &&
        $(this)
          .parent()
          .hasClass("p-2")
      ) {
        console.log("Player 2 picked " + choice);
        player2ChoiceRef.set(choice);
        gameTurnRef.set(3);
      }
    }
  });

  gameTurnRef.set(0);
});
