
let socket = io.connect('https://hidden-caverns-22423.herokuapp.com/'); //for heraku deployment

const output = document.getElementById('output'),
    outputwin = document.getElementById('output-window'),
    name = document.getElementById('name'),
    message = document.getElementById('message'),
    btn = document.getElementById('send');


btn.addEventListener('click', () => {
    socket.emit('chat', {
        message: message.value,
        name: name.value,
        isMe: true
    });
    message.value = '';
});


socket.on('chat', data => {

    let today = new Date(),
        h = doubleCheck(today.getHours()),
        m = doubleCheck(today.getMinutes()),
        meclass = '';

    if (data.isMe == true) {
        meclass = 'itsme';
    }

    output.innerHTML += '<p>[' + h + ':' + m + '] <strong class="' + meclass + '">' + data.name + ': </strong>' + data.message + '<p>';
    updateScroll();
});


function doubleCheck(dateObject) {

    if (dateObject < 10) {
        return "0" + dateObject;
    }
    return dateObject;

}

function updateScroll() {

    outputwin.scrollTop = outputwin.scrollHeight;

}

