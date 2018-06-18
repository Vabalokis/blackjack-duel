      //Buttons
const join = document.getElementById('join'),
      leave = document.getElementById('leave'),
      hit = document.getElementById('hit'),
      stand = document.getElementById('stand'),
      //Info
      playerCards = document.getElementById('playerCards'),
      playerInfo = document.getElementById('playerInfo'),
      enemyCards = document.getElementById('enemyCards'),
      enemyInfo = document.getElementById('enemyInfo'),
      timeLeft = document.getElementById('timeLeft');
let   time = 15 , myVar; //myVar = setInterval(myTimer, 1000);
      

join.addEventListener('click', () => {
            socket.emit('gameEvent', {
            id: socket.id,
            status: 'join'
      });
});

leave.addEventListener('click', () => {
      socket.emit('gameEvent', {
            id: socket.id,
            status: 'leave'
      });
});

hit.addEventListener('click', () => {
      socket.emit('gameEvent', {
            id: socket.id,
            status: 'hit'
      });
});

stand.addEventListener('click', () => {
      socket.emit('gameEvent', {
            id: socket.id,
            status: 'stand'
      });
});


socket.on('buttons', data => {
      if(data.players < 2 && !data.isPlaying) { //Not playing but can join to play 
            enableButton(join);
            disableButton(leave);
            disableButton(hit);
            disableButton(stand);  
      }

      if(data.players == 2 && data.isPlaying) { // Joined the game and playing
            disableButton(join);
            enableButton(leave);
            enableButton(hit);
            enableButton(stand);
      }

      if(data.players < 2 && data.isPlaying) {    // Joined the game but waiting for oponent
            disableButton(join);
            enableButton(leave);
            disableButton(hit);
            disableButton(stand);    
      }

      if(data.players == 2 && !data.isPlaying) {    // Someone is already playing
            disableButton(join);
            disableButton(leave);
            disableButton(hit);
            disableButton(stand);   
      }

});


socket.on('end', data => {
      if(data.enemy == 0 && data.player ==0){
      showTie(playerCards);
      showTie(enemyCards);
      } else if (data.player == 1 && data.enemy == 0){
      showWinner(playerCards);
      showLoser(enemyCards);
      } else if (data.player == 0 && data.enemy == 1) {
      showWinner(enemyCards);
      showLoser(playerCards);
      }
      setTimeout(()=> {
      revertshow()
        }, 10000);
});


socket.on('gamestart', () => {
      time = 15;
      myVar = setInterval(myTimer, 1000);
});

socket.on('redrawCards', data => {
      if(data.waitingroom && !data.endresult){ 
            showFacedDown("playerCards");
            showFacedDown("enemyCards");      
         } else if (!data.waitingroom && !data.endresult) {
            showFacedDown("enemyCards");
         }  
      displayHand(data.playerhand , "playerCards");
      displayHand(data.enemyhand , "enemyCards");
});

socket.on('redrawInfo', data => {
      if(data.waitingroom && !data.endresult){ 
            enemyInfo.innerHTML = 'PLAYER 2 CARD VALUE: X + ' + data.enemycardvalue;
           playerInfo.innerHTML = 'PLAYER 1 CARD VALUE: X + ' + data.playercardvalue;
      } else if (!data.waitingroom && !data.endresult) {
            enemyInfo.innerHTML = 'ENEMY CARD VALUE: X + ' + data.enemycardvalue;
           playerInfo.innerHTML = 'PLAYER CARD VALUE: ' + data.playercardvalue;
      } else if (!data.waitingroom && data.endresult) { 
            enemyInfo.innerHTML = 'ENEMY CARD VALUE: ' + data.enemycardvalue;
           playerInfo.innerHTML = 'PLAYER CARD VALUE: ' + data.playercardvalue;
           setTimeout(() => {
            enemyInfo.innerHTML = '';
            playerInfo.innerHTML = '';  
        }, 10000);         
      } else if (data.waitingroom && data.endresult) {
            enemyInfo.innerHTML = 'PLAYER 2 CARD VALUE: ' + data.enemycardvalue;
           playerInfo.innerHTML = 'PLAYER 1 CARD VALUE: ' + data.playercardvalue;
           setTimeout(() => {
            enemyInfo.innerHTML = '';
            playerInfo.innerHTML = '';  
        }, 10000);     
       }
});



function myTimer() {
    document.getElementById("timeLeft").innerHTML = 'TIME LEFT: ' + time--;
    if(time  == -1) {
      clearInterval(myVar);
    }
}

socket.on('clear' , () => {
      playerCards.innerHTML = '';
      enemyCards.innerHTML = '';
})


function showFacedDown(position){
      let img = document.createElement("img");
      img.src = "img/cards/Different-BikeBack.png";
      img.width = 90;
      img.height = 140;
      img.id = "cardImage";
      document.getElementById(position).appendChild(img);
}

function disableButton(elem) {
    elem.disabled = true;
    elem.style.background = 'grey';
    elem.style.cursor = 'default';
}

function enableButton(elem) {
    elem.disabled = false;
    elem.style.background = 'rgba(76, 76, 216, 0.95)';
    elem.style.cursor = 'pointer';
}

function showWinner(elem) {
      elem.style.background = 'rgba(126, 255, 51, 0.658)';
}

function showLoser(elem) {
      elem.style.background = 'rgba(255, 35, 35, 0.753)';
}

function showTie(elem) {
      elem.style.background = 'rgba(251, 255, 0, 0.733)';
}

function revertshow() {
      playerCards.style.background = 'rgba(206, 206, 206 , 0.95)';
      enemyCards.style.background = 'rgba(232, 232, 232 , 0.95)';
}


function displayHand(hand , position){
      if(Array.isArray(hand)) {
       for(let i = 0 ; i < hand.length ; i++){
           imageShow(hand[i] , position);
        } 
      } else
      imageShow(hand , position);
}
  
function imageShow (card , position) {
      let img = document.createElement("img");
      img.src = checkSrc(card);
      img.width = 90;
      img.height = 140;
      img.id = "cardImage";
      //img.style.filter = "alpha(opacity = 0)";
      document.getElementById(position).appendChild(img);
  }
  
  
  function checkSrc(card){
      let value; 
      switch (card.charAt(1)){
      
      case "D":
              value = checkCard(card,"diamonds");
              break;
      case "C":
              value = checkCard(card,"clubs");
              break;
      case "S":
              value = checkCard(card,"spades");
              break;
      case "H":
              value = checkCard(card,"hearts");
              break;
         } 
      return value; 
      }
  
  
      function checkCard(card,type){
          let value; 
          switch (card.charAt(0)){
          
          case "1":
                  value = "img/cards/ace_of_" + type + ".png";
                  break;
          case "2":
                  value = "img/cards/2_of_" + type + ".png";
                  break;
          case "3":
                  value = "img/cards/3_of_" + type + ".png";
                  break;
          case "4":
                  value = "img/cards/4_of_" + type + ".png";
                  break;
          case "5":
                  value = "img/cards/5_of_" + type + ".png";
                  break;
          case "6":
                  value = "img/cards/6_of_" + type + ".png";
                  break;
          case "7":
                  value = "img/cards/7_of_" + type + ".png";
                  break;
          case "8":
                  value = "img/cards/8_of_" + type + ".png";
                  break;
          case "9":
                  value = "img/cards/9_of_" + type + ".png";
                  break;
          case "0":
                  value = "img/cards/10_of_" + type + ".png";
                  break;
          case "J":
                  value = "img/cards/jack_of_" + type + ".png";
                  break;
          case "Q":
                  value = "img/cards/queen_of_" + type + ".png";
                  break;
          case "K":
                  value = "img/cards/king_of_" + type + ".png";
                  break;
              }
          return value;
          }
  
  

                  

