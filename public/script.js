const processForm = document.getElementById('process-form');
const addProcessButton = document.getElementById('add-process');
const resultDiv = document.getElementById('result');

addProcessButton.addEventListener('click', addProcess);

function addProcess(event) {
    event.preventDefault();

    const processesGroup = document.getElementById('processes-group');
    const processGroup = document.createElement('div');
    processGroup.classList.add('form-group');

    const processNameLabel = document.createElement('label');
    processNameLabel.innerText = 'Nama Proses:';
    const processNameInput = document.createElement('input');
    processNameInput.type = 'text';
    processNameInput.classList.add('process-name');
    processNameInput.required = true;

    const burstTimeLabel = document.createElement('label');
    burstTimeLabel.innerText = 'Waktu Burst:';
    const burstTimeInput = document.createElement('input');
    burstTimeInput.type = 'number';
    burstTimeInput.min = '1';
    burstTimeInput.classList.add('burst-time');
    burstTimeInput.required = true;

    processGroup.appendChild(processNameLabel);
    processGroup.appendChild(processNameInput);
    processGroup.appendChild(burstTimeLabel);
    processGroup.appendChild(burstTimeInput);

    processesGroup.appendChild(processGroup);
}

processForm.addEventListener('submit', schedule);

function schedule(event) {
    event.preventDefault();

    const timeQuantumInput = document.getElementById('time-quantum');
    const processNames = document.getElementsByClassName('process-name');
    const burstTimes = document.getElementsByClassName('burst-time');

    const processes = [];

    for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i].value;
        const burstTime = parseInt(burstTimes[i].value);

        if (processName !== '' && !isNaN(burstTime) && burstTime > 0) {
            processes.push({ name: processName, burstTime });
        }
    }

    const timeQuantum = parseInt(timeQuantumInput.value);

    fetch('/schedule-RR', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processes, timeQuantum }),
    })
        .then((response) => response.json())
        .then((data) => {
            resultDiv.innerText = `Waktu Tunggu Rata-rata: ${data.avgWaitingTime} \n Waktu Putar Rata-rata: ${data.avgTurnaroundTime}`;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
