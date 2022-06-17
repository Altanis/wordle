if (!localStorage.id) {
    window.location.href = '/';
}

window.onload = () => {
    if (localStorage.darkMode) { 
        document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        document.querySelectorAll('.modal-content').forEach(element => { element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; element.style.color = '#FFFFFF'; });

        document.querySelectorAll('h1').forEach(element => element.style.color = '#FFFFFF');
        document.querySelectorAll('button').forEach(element => element.style.color = '#FFFFFF');
    }
};

const triggerEvent = (type) => {
    switch (type) {
        case 'darkMode': {
            if (localStorage.darkMode) {
                delete localStorage.darkMode;
                document.body.style.backgroundColor = '#FFFFFF';
                document.querySelectorAll('.modal-content').forEach(element => { element.style.backgroundColor = '#FFFFFF'; element.style.color = '#000000'; });

                document.querySelectorAll('h1').forEach(element => element.style.color = '#000000');
                document.querySelectorAll('button').forEach(element => element.style.color = '#000000');
            } else {
                localStorage.darkMode = true;
                document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; 
                document.querySelectorAll('.modal-content').forEach(element => { element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; element.style.color = '#FFFFFF'; });

                document.querySelectorAll('h1').forEach(element => element.style.color = '#FFFFFF');
                document.querySelectorAll('button').forEach(element => element.style.color = '#FFFFFF');
            }
            break;
        }
    }
};

const initGame = async () => {
    
};

const getOptions = () => {
    event?.target?.blur();

    document.querySelector('.options-modal-body').innerHTML = `
    <label for="screenshots" id="screenshots_label">
        Dark Mode
    </label> 
    <input type="checkbox" onclick="triggerEvent('darkMode')" id="screenshots" ${localStorage.darkMode ? 'checked': ''}>`;

    $('#options-modal').modal();
};

const getStats = async (finishedGame) => {
    event?.target?.blur();

    const stats = await fetch('http://localhost:3000/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: localStorage.id, type: 'multiplayer' }),
    }).then(r => r.json());

    console.log(stats);

    document.querySelector('.modal-body').innerHTML = `
        <p style="color: green;">Correct: ${stats.correct}</p>
        <p style="color: red;">Incorrect: ${stats.incorrect}</p>
        <p>Win Percentage: ${stats.win_percentage}</p>`;

    if (finishedGame && document.querySelector('.modal-footer').children.length !== 3) {
        document.querySelector('.modal-footer').innerHTML += `
        <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="TileSystem.reset();">Restart</button>
        <button type="button" class="btn btn-primary" onclick="TileSystem.copyBoard();">Export as Unicode</button>
        `;
    }
    $('#modal').modal();
};