const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('listening to port 4000');
});

app.use(express.static('public'));

let io = socket(server);

const skaiciai = ["2D", "2H", "2C", "2S",
    "3D", "3H", "3C", "3S",
    "4D", "4H", "4C", "4S",
    "5D", "5H", "5C", "5S",
    "6D", "6H", "6C", "6S",
    "7D", "7H", "7C", "7S",
    "8D", "8H", "8C", "8S",
    "9D", "9H", "9C", "9S"];

const galvos = ["0D", "0H", "0C", "0S",
    "JD", "JH", "JC", "JS",
    "QD", "QH", "QC", "QS",
    "KD", "KH", "KC", "KS"];

const tuzai = ["1D", "1H", "1C", "1S"];

let player1, player2;
let players = [];


class Player {

    constructor(id) {
        this.id = id;
        this.currentHand = [];
    }

    getID() {
        return this.id;
    }

    AddaCard(card) {
        this.currentHand.push(card);
    }

    getHand() {
        return this.currentHand;
    }
}

class Deck {


    constructor(numOfDecks) {
        this.numOfDecks = numOfDecks; // Setting up how many decks should be in the shoe.
        this.shoe = [];
    }


    generateDeck() {
        return skaiciai.concat(galvos).concat(tuzai);
    }


    generateShoe() {

        for (let i = 0; i < this.numOfDecks; i++) {
            let newDeck = this.generateDeck();
            this.shuffletimes(newDeck, 5);
            this.shoe = this.shoe.concat(newDeck);
            this.shuffletimes(this.shoe, 5);
        }

    }


    shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }


    shuffletimes(arr, times) {
        for (let i = 0; i < times; i++) {
            this.shuffle(arr);
        }
    }

    clearCards() {

        this.shoe = [];

    }

    takeCard() {

        return this.shoe.pop();

    }

    takeShoe() {

        return this.shoe;

    }

}

function isPlaying(id) {

    for (let i = 0; i < players.length; i++) {
        if (players[i] == id) {
            return true;
        }
    }

}

function removePlayer(id) {

    for (let i = players.length - 1; i >= 0; i--) {
        if (players[i] === id) {
            players.splice(i, 1);
            break;
        }
    }

}

function refreshRoomButtons() {

    io.to('waiting').emit('buttons', {
        players: players.length,
        isPlaying: false
    });
    io.to('game').emit('buttons', {
        players: players.length,
        isPlaying: true
    });

}

function checkforPlayers(socket) {

    if (players.length == 2) gameStart(socket);

}

function redrawCards(end) {

    clearCardsVisual();
    if (!end) {
        // Sending card data to player1
        io.to(player1.getID()).emit('redrawCards', {
            enemyhand: player2.getHand().slice(1),
            playerhand: player1.getHand(),
            waitingroom: false,
            endresult: false
        });
        // Sending card data to player2 
        io.to(player2.getID()).emit('redrawCards', {
            enemyhand: player1.getHand().slice(1),
            playerhand: player2.getHand(),
            waitingroom: false,
            endresult: false
        });
        // Sending card data to spectators
        io.to('waiting').emit('redrawCards', {
            enemyhand: player1.getHand().slice(1),
            playerhand: player2.getHand().slice(1),
            waitingroom: true,
            endresult: false
        });

    } else {
        // Sending card data to player1 at the end of the match
        io.to(player1.getID()).emit('redrawCards', {
            enemyhand: player2.getHand(),
            playerhand: player1.getHand(),
            waitingroom: false,
            endresult: true
        });
        // Sending card data to player2 at the end of the match
        io.to(player2.getID()).emit('redrawCards', {
            enemyhand: player1.getHand(),
            playerhand: player2.getHand(),
            waitingroom: false,
            endresult: true
        });
        // Sending card data to spectators at the end of the match
        io.to('waiting').emit('redrawCards', {
            enemyhand: player1.getHand(),
            playerhand: player2.getHand(),
            waitingroom: true,
            endresult: true
        });
    }

}

function redrawInfo(end) {

    if (!end) {
        io.to(player1.getID()).emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player2.getHand().slice(1)),
            playercardvalue: cehckHandValue(player1.getHand()),
            waitingroom: false,
            endresult: false
        });
        io.to(player2.getID()).emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player1.getHand().slice(1)),
            playercardvalue: cehckHandValue(player2.getHand()),
            waitingroom: false,
            endresult: false
        });
        io.to('waiting').emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player1.getHand().slice(1)),
            playercardvalue: cehckHandValue(player2.getHand().slice(1)),
            waitingroom: true,
            endresult: false
        });
    } else {
        io.to(player1.getID()).emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player2.getHand()),
            playercardvalue: cehckHandValue(player1.getHand()),
            waitingroom: false,
            endresult: true
        });
        io.to(player2.getID()).emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player1.getHand()),
            playercardvalue: cehckHandValue(player2.getHand()),
            waitingroom: false,
            endresult: true
        });
        io.to('waiting').emit('redrawInfo', {
            enemycardvalue: cehckHandValue(player1.getHand()),
            playercardvalue: cehckHandValue(player2.getHand()),
            waitingroom: true,
            endresult: true
        });
    }

}

function gameStart(socket) {

    player1 = new Player(players[0]);
    player2 = new Player(players[1]);
    deck = new Deck(5);
    deck.generateShoe();
    playerTakesAcard();
    playerTakesAcard();
    redrawCards(false);
    redrawInfo(false);
    io.emit('gamestart', {});
    setTimeout(() => {
        endGame();
    }, 16000);

}

function playerTakesAcard() {

    player1.AddaCard(deck.takeCard());
    player2.AddaCard(deck.takeCard());

}

function gameStop() {

    player1 = null;
    player2 = null;
    players = [];
    refreshRoomButtons();

}

function clearCardsVisual() {

    io.emit('clear', {});

}

function showending() {

    pl1hnd = cehckHandValue(player1.getHand());
    pl2hnd = cehckHandValue(player2.getHand());

    if (pl1hnd == pl2hnd) { // 0 - lost ; 1 - won
        endingDes(0, 0);
    } else
        if (pl1hnd > 21 && pl2hnd > 21) {
            endingDes(0, 0);
        } else
            if (pl1hnd > 21 && pl2hnd <= 21) {
                endingDes(0, 1);
            } else
                if (pl2hnd > 21 && pl1hnd <= 21) {
                    endingDes(1, 0);
                } else

                    if (Math.abs(21 - pl1hnd) < Math.abs(21 - pl2hnd)) {
                        endingDes(1, 0);
                    } else
                        if (Math.abs(21 - pl1hnd) > Math.abs(21 - pl2hnd)) {
                            endingDes(0, 1);
                        }

}


function endingDes(player11, player22) {

    io.to(player1.getID()).emit('end', {
        enemy: player22,
        player: player11
    });
    io.to(player2.getID()).emit('end', {
        enemy: player11,
        player: player22
    });
    io.to('waiting').emit('end', {
        enemy: player11,
        player: player22
    });
}


function endGame() {
    showending();
    redrawInfo(true);
    redrawCards(true);
    setTimeout(() => {
        player1 = null;
        player2 = null;
        players = [];
        clearjoinRoom('game', 'waiting', '/'); // c
        clearCardsVisual();
        refreshRoomButtons();
    }, 10000);
}

function clearjoinRoom(room, room2, namespace = '/') {
    let roomObj = io.nsps[namespace].adapter.rooms[room];
    if (roomObj) {
        // now kick everyone out of this room
        Object.keys(roomObj.sockets).forEach(id => {
            io.sockets.connected[id].leave(room);
            io.sockets.connected[id].join(room2);
        })
    }
}


function checkCardValue(card) {

    let value = 0;
    switch (card.charAt(0)) {

        case "K":
            value = 10;
            break;
        case "Q":
            value = 10;
            break;
        case "J":
            value = 10;
            break;
        case "0":
            value = 10;
            break;
        case "1":
            value = 11;
            break;
        case "2":
            value = 2;
            break;
        case "3":
            value = 3;
            break;
        case "4":
            value = 4;
            break;
        case "5":
            value = 5;
            break;
        case "6":
            value = 6;
            break;
        case "7":
            value = 7;
            break;
        case "8":
            value = 8;
            break;
        case "9":
            value = 9;
            break;


    }

    return value;

}

function cehckHandValue(hand) {

    let value = 0;
    for (let i = 0; i < hand.length; i++) {
        currentCardValue = checkCardValue(hand[i]);

        if (currentCardValue == 11 && value > 10) {
            currentCardValue = 1;
        }

        value += currentCardValue;
    }
    return value;
}



io.on('connection', socket => {

    console.log('made socket connection with ' + socket.id);

    //Joining waiting room initially

    socket.join('waiting');

    if (players.length == 2) {
        redrawCards(false);
        redrawInfo(false);
    }

    //Listening for chat event

    socket.on('chat', data => {
        //Sending message to yourself with isMe == true
        socket.emit('chat', data);
        //Setting isMe to false and then sending data to all other sockets
        data.isMe = false;
        socket.broadcast.emit('chat', data);
    });

    //Sending button status information

    socket.emit('buttons', {
        players: players.length,
        isPlaying: isPlaying(socket.id) //isPlaying(socket.id)
    });

    //Listening for blackjack events

    socket.on('gameEvent', data => {

        if (data.status == 'join' && players.length < 2) {
            socket.leave('waiting');
            socket.join('game');
            players.push(socket.id);
            refreshRoomButtons();
            checkforPlayers(socket);
        }

        if (data.status == 'leave') {
            gameStop();
            socket.leave('game');
            socket.join('waiting');
            removePlayer(socket.id);
            refreshRoomButtons();

        }

        if (data.status == 'hit') {
            if (data.id == player1.getID()) {
                player1.AddaCard(deck.takeCard());
            } else {
                player2.AddaCard(deck.takeCard());
            }
            io.emit('clear', {});
            redrawCards(false);
            redrawInfo(false);
        }

        if (data.status == 'stand') {



        }

    });


});



