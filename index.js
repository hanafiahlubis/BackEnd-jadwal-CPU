import express from 'express';
const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/schedule-RR', (req, res) => {
    console.log(req.body);
    const processes = req.body.processes;
    const timeQuantum = parseInt(req.body.timeQuantum);
    console.log(processes)
    let waitingTime = [];
    let turnaroundTime = [];
    let remainingTime = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    for (let i = 0; i < processes.length; i++) {
        remainingTime[i] = parseInt(processes[i].burstTime);
    }

    let currentTime = 0;
    let flag = true;

    while (flag) {
        flag = false;

        for (let i = 0; i < processes.length; i++) {
            if (remainingTime[i] > 0) {
                flag = true;

                if (remainingTime[i] > timeQuantum) {
                    currentTime += timeQuantum;
                    remainingTime[i] -= timeQuantum;
                } else {
                    currentTime += remainingTime[i];
                    waitingTime[i] = currentTime - processes[i].burstTime;
                    remainingTime[i] = 0;
                }
            }
        }
    }

    for (let i = 0; i < processes.length; i++) {
        turnaroundTime[i] = processes[i].burstTime + waitingTime[i];
        totalWaitingTime += waitingTime[i];
        totalTurnaroundTime += turnaroundTime[i];
    }

    const avgWaitingTime = totalWaitingTime / processes.length;
    const avgTurnaroundTime = totalTurnaroundTime / processes.length;

    const result = {
        avgWaitingTime: avgWaitingTime.toFixed(2),
        avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
    };
    console.log(result)
    res.json(result);
});

let cpuSchedule = [];

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

app.get('/schedule-sfj', (req, res) => {
    res.json(cpuSchedule);
});

app.post('/schedule-sfj', (req, res) => {
    console.log(req.body);
    const { process, arrivalTime, burstTime } = req.body;
    const newProcess = {
        process,
        arrivalTime,
        burstTime
    };
    cpuSchedule.push(newProcess);
    cpuSchedule.sort((a, b) => a.burstTime - b.burstTime);
    const averageWaitingTime = calculateAverageWaitingTime(cpuSchedule);
    const averageTurnaroundTime = calculateAverageTurnaroundTime(cpuSchedule);
    res.sendStatus(200);
});

let cpuSchedule2 = [];

app.post('/schedule-priority', (req, res) => {
    console.log(req.body);
    const process = req.body.process;
    const burstTime = req.body.burstTime;
    const priority = req.body.priority;
    cpuSchedule2.push({ process, burstTime, priority });
    cpuSchedule2.sort((a, b) => a.priority - b.priority);
    res.status(201).json({ message: 'Proses ditambahkan ke jadwal CPU' });
});

app.get('/schedule-priority', (req, res) => {
    cpuSchedule2.forEach((process, index) => {
        const waitingTime = index === 0 ? 0 : cpuSchedule2[index - 1].waitingTime + cpuSchedule2[index - 1].burstTime;
        process.waitingTime = waitingTime;
    });
    console.log(cpuSchedule2);
    res.json(cpuSchedule2);
});

class Task {
    constructor(arrivalTime, executionTime) {
        this.arrivalTime = arrivalTime;
        this.executionTime = executionTime;
    }
}

app.post('/fcfs', (req, res) => {
    const tasks = req.body.tasks.map(task => new Task(task.arrivalTime, task.executionTime));

    let currentTime = 0; // Waktu saat ini
    let waitingTime = 0; // Waktu menunggu total
    let turnaroundTime = 0; // Waktu total dari kedatangan hingga selesai

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        // Hitung waktu tunggu
        const taskWaitingTime = Math.max(0, currentTime - task.arrivalTime);
        waitingTime += taskWaitingTime;

        // Hitung waktu selesai
        const taskFinishTime = currentTime + task.executionTime;
        turnaroundTime += taskFinishTime - task.arrivalTime;

        currentTime = taskFinishTime; // Perbarui waktu saat ini
    }

    const averageWaitingTime = waitingTime / tasks.length; // Hitung waktu rata-rata menunggu
    const averageTurnaroundTime = turnaroundTime / tasks.length; // Hitung waktu rata-rata putaran

    // Kirim hasil sebagai respons
    res.json({
        averageWaitingTime: averageWaitingTime,
        averageTurnaroundTime: averageTurnaroundTime
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
