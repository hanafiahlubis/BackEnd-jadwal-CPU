function calculateAverageWaitingTime(schedule) {
    let totalWaitingTime = 0;
    schedule.forEach((process, index) => {
        const waitingTime = index === 0 ? 0 : schedule[index - 1].turnaroundTime;
        process.waitingTime = waitingTime;
        totalWaitingTime += waitingTime;
    });
    return totalWaitingTime / schedule.length;
}

function calculateAverageTurnaroundTime(schedule) {
    let totalTurnaroundTime = 0;
    schedule.forEach(process => {
        const turnaroundTime = process.waitingTime + process.burstTime;
        process.turnaroundTime = turnaroundTime;
        totalTurnaroundTime += turnaroundTime;
    });
    return totalTurnaroundTime / schedule.length;
}

function createScheduleTable(schedule) {
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    scheduleTableBody.innerHTML = '';

    schedule.forEach((process, index) => {
        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = index + 1;

        const processCell = document.createElement('td');
        processCell.textContent = process.process;

        const arrivalTimeCell = document.createElement('td');
        arrivalTimeCell.textContent = process.arrivalTime;

        const burstTimeCell = document.createElement('td');
        burstTimeCell.textContent = process.burstTime;

        const waitingTimeCell = document.createElement('td');
        waitingTimeCell.textContent = process.waitingTime || '-';

        row.appendChild(numberCell);
        row.appendChild(processCell);
        row.appendChild(arrivalTimeCell);
        row.appendChild(burstTimeCell);
        row.appendChild(waitingTimeCell);

        scheduleTableBody.appendChild(row);
    });
}

function updateAverageTimes(averageWaitingTime, averageTurnaroundTime) {
    const averageWaitingTimeSpan = document.getElementById('averageWaitingTime');
    averageWaitingTimeSpan.textContent = averageWaitingTime.toFixed(2);

    const averageTurnaroundTimeSpan = document.getElementById('averageTurnaroundTime');
    averageTurnaroundTimeSpan.textContent = averageTurnaroundTime.toFixed(2);
}

function getSchedule() {
    fetch('/schedule-sfj')
        .then(response => response.json())
        .then(schedule => {
            const averageWaitingTime = calculateAverageWaitingTime(schedule);
            const averageTurnaroundTime = calculateAverageTurnaroundTime(schedule);

            createScheduleTable(schedule);
            updateAverageTimes(averageWaitingTime, averageTurnaroundTime);
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
        });
}

function addProcess(process, arrivalTime, burstTime) {
    fetch('/schedule-sfj', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ process, arrivalTime, burstTime })
    })
        .then(response => {
            if (response.ok) {
                console.log('Proses ditambahkan ke jadwal CPU');
                getSchedule();
            } else {
                throw new Error('Gagal menambahkan proses ke jadwal CPU');
            }
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
        });
}

function scheduleProcesses() {
    fetch('/schedule-sfj/schedule', {
        method: 'POST'
    })
        .then(response => {
            if (response.ok) {
                console.log('Proses berhasil dijadwalkan');
                getSchedule();
            } else {
                throw new Error('Gagal menjadwalkan proses');
            }
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
        });
}

const processForm = document.getElementById('processForm');
processForm.addEventListener('submit', event => {
    event.preventDefault();
    const processInput = document.getElementById('processInput');
    const arrivalTimeInput = document.getElementById('arrivalTimeInput');
    const burstTimeInput = document.getElementById('burstTimeInput');
    const process = processInput.value;
    const arrivalTime = parseInt(arrivalTimeInput.value);
    const burstTime = parseInt(burstTimeInput.value);
    addProcess(process, arrivalTime, burstTime);
    processInput.value = '';
    arrivalTimeInput.value = '';
    burstTimeInput.value = '';
});

getSchedule();
