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
var player1Nickname = database.ref("player1Nickname");
var player2Nickname = database.ref("player2Nickname");
var nickname1 = "";
var nickname2 = "";
var chatMessage = database.ref("chatMessage");

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
    $("#game-text").append(
      "<p class='game-info'>Waiting for player 2 to connect...</p>"
    );
  } else {
    if (playerNum === 0) {
      playerNum = 2;
    }
    $("#game-text").append(
      "<p class='game-info'>The game is ready to begin!</p>"
    );
    gameTurnRef.set(1);
  }
  $("#game-text").scrollTop($("#game-text")[0].scrollHeight);
});

gameTurnRef.on("value", function(snapshot) {
  playerTurn = snapshot.val();
  if (playerTurn === 3) {
    $("#player-1-controls").css("display", "none");
    $("#player-2-controls").css("display", "none");
    evalWinner(); // game logic here
  } else if (playerTurn > 0) {
    $("#game-text").append(
      "<p class='game-info'>Player " + playerTurn + "'s turn!</p>"
    );
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
    }
    $("#game-text").scrollTop($("#game-text")[0].scrollHeight);
  }
});

chatMessage.on("value", function(snapshot) {
  var newChat = snapshot.val();
  if (newChat != "") {
    $("#game-text").append("<p class='chat-info'>" + newChat + "</p>");
    $("#game-text").scrollTop($("#game-text")[0].scrollHeight);
    chatMessage.set("");
  }
});

player1ChoiceRef.on("value", function(snapshot) {
  player1Choice = snapshot.val();
});
player2ChoiceRef.on("value", function(snapshot) {
  player2Choice = snapshot.val();
});
player1Nickname.on("value", function(snapshot) {
  nickname1 = snapshot.val();
  $("#nickname-display-1").text(nickname1);
});
player2Nickname.on("value", function(snapshot) {
  nickname2 = snapshot.val();
  $("#nickname-display-2").text(nickname2);
});

function toggleHands() {
  if (player1Choice === "scissors") {
    $("#p1-f1").toggleClass("finger-1-scissor");
    $("#p1-f2").toggleClass("finger-2-scissor");
  } else if (player1Choice === "paper") {
    $("#p1-f1").toggleClass("finger-1-paper");
    $("#p1-f2").toggleClass("finger-2-paper");
    $("#p1-f3").toggleClass("finger-3-paper");
    $("#p1-f4").toggleClass("finger-4-paper");
    $("#p1-t1").toggleClass("thumb-fist-paper");
    $("#p1-t2").toggleClass("thumb2-fist-paper");
    $("#p1-t3").toggleClass("palm-fist-paper");
  }

  if (player2Choice === "scissors") {
    $("#p2-f1").toggleClass("finger-1-scissor");
    $("#p2-f2").toggleClass("finger-2-scissor");
  } else if (player2Choice === "paper") {
    $("#p2-f1").toggleClass("finger-1-paper");
    $("#p2-f2").toggleClass("finger-2-paper");
    $("#p2-f3").toggleClass("finger-3-paper");
    $("#p2-f4").toggleClass("finger-4-paper");
    $("#p2-t1").toggleClass("thumb-fist-paper");
    $("#p2-t2").toggleClass("thumb2-fist-paper");
    $("#p2-t3").toggleClass("palm-fist-paper");
  }
}

function evalWinner() {
  toggleHands();

  if (player1Choice === player2Choice) {
    // draw
    $("#game-text").append(
      "<p class='game-info'>Draw! Both players chose " + player1Choice + "!</p>"
    );
  } else if (
    (player1Choice === "rock" && player2Choice === "scissors") ||
    (player1Choice === "scissors" && player2Choice === "paper") ||
    (player1Choice === "paper" && player2Choice === "rock")
  ) {
    //player 1 win
    $("#game-text").append(
      "<p class='game-info'>Player 1 wins with " + player1Choice + "!</p>"
    );
  } else {
    // player 2 win
    $("#game-text").append(
      "<p class='game-info'>Player 2 wins with " + player2Choice + "!</p>"
    );
  }
  gameTurnRef.set(1);
  $("#game-text").scrollTop($("#game-text")[0].scrollHeight);

  setTimeout(function() {
    toggleHands();
  }, 2000);
}

$(document).ready(function() {
  $("#connect-button").on("click", function() {
    var con = connectionsRef.push(true);
  });

  $("#chat-button").on("click", function(e) {
    e.preventDefault();
    var messageNickname = "";
    if (playerNum === 1) {
      messageNickname = nickname1;
    } else {
      messageNickname = nickname2;
    }
    chatMessage.set(
      "<span class='chat-name'>" +
        messageNickname +
        "</span>: " +
        $("#chat-input")
          .val()
          .trim()
    );
    $("#chat-input").val("");
  });

  $("#nickname-button").on("click", function(e) {
    e.preventDefault();
    var nicknameInput = $("#nickname-input")
      .val()
      .trim();
    if (nicknameInput != "") {
      if (playerNum === 1) {
        player1Nickname.set(nicknameInput);
      } else {
        player2Nickname.set(nicknameInput);
      }
    }
    $("#nickname-input").val("");
  });

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
  $("#nickname-display").text(nickname1);
});
