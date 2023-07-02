// script.js

let cpuSchedule = [];
function calculateAverageWaitingTime(schedule) {
    let totalWaitingTime = 0;
    schedule.forEach((process, index) => {
        const waitingTime = index === 0 ? 0 : schedule[index - 1].waitingTime + schedule[index - 1].burstTime;
        process.waitingTime = waitingTime;
        totalWaitingTime += waitingTime;
    });
    return totalWaitingTime / schedule.length;
}



function getSchedule() {
    fetch('/schedule-priority')
        .then((response) => response.json())
        .then((schedule) => {
            console.log(schedule)
            const scheduleTableBody = document.getElementById('scheduleTableBody');
            scheduleTableBody.innerHTML = '';
            schedule.forEach((process, index) => {
                const row = document.createElement('tr');
                const numberCell = document.createElement('td');
                const processCell = document.createElement('td');
                const burstTimeCell = document.createElement('td');
                const priorityCell = document.createElement('td');
                const waitingTimeCell = document.createElement('td');
                numberCell.textContent = index + 1;
                processCell.textContent = process.process;
                burstTimeCell.textContent = process.burstTime;
                priorityCell.textContent = process.priority;
                waitingTimeCell.textContent = process.waitingTime || '-';
                row.appendChild(numberCell);
                row.appendChild(processCell);
                row.appendChild(burstTimeCell);
                row.appendChild(priorityCell);
                row.appendChild(waitingTimeCell);
                scheduleTableBody.appendChild(row);
            });

            const averageWaitingTime = calculateAverageWaitingTime(schedule);
            document.getElementById('averageWaitingTime').textContent =
                averageWaitingTime.toFixed(2);
        })
        .catch((error) => {
            console.error('Terjadi kesalahan:', error);
        });
}

function addProcess(process, burstTime, priority) {
    fetch('/schedule-priority', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ process, burstTime, priority }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Proses ditambahkan ke jadwal CPU');
                getSchedule();
            } else {
                throw new Error('Gagal menambahkan proses ke jadwal CPU');
            }
        })
        .catch((error) => {
            console.error('Terjadi kesalahan:', error);
        });
}

function scheduleProcesses() {
    fetch('/schedule-priority/schedule', {
        method: 'POST',
    })
        .then((response) => {
            if (response.ok) {
                console.log('Proses berhasil dijadwalkan');
                getSchedule();
            } else {
                throw new Error('Gagal menjadwalkan proses');
            }
        })
        .catch((error) => {
            console.error('Terjadi kesalahan:', error);
        });
}

const processForm = document.getElementById('processForm');
processForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const processInput = document.getElementById('processInput');
    const burstTimeInput = document.getElementById('burstTimeInput');
    const priorityInput = document.getElementById('priorityInput');
    const process = processInput.value;
    const burstTime = parseInt(burstTimeInput.value);
    const priority = parseInt(priorityInput.value);
    addProcess(process, burstTime, priority);
    processInput.value = '';
    burstTimeInput.value = '';
    priorityInput.value = '';
});

getSchedule();
