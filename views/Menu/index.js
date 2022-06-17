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

const getOptions = () => {
    event?.target?.blur();

    document.querySelector('.options-modal-body').innerHTML = `
    <label for="screenshots" id="screenshots_label">
        Dark Mode
    </label> 
    <input type="checkbox" onclick="triggerEvent('darkMode')" id="screenshots" ${localStorage.darkMode ? 'checked': ''}>`;

    $('#options-modal').modal();
};