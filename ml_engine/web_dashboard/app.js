let eerChart = null;
let featureChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateValues();
    runPrediction();
});

function updateValues() {
    const hours = document.getElementById('input-hours').value;
    const difficulty = document.getElementById('input-difficulty').value;
    const quiz = document.getElementById('input-quiz').value;
    const confidence = document.getElementById('input-confidence').value;

    document.getElementById('val-hours').innerText = `${hours} hrs`;
    document.getElementById('val-difficulty').innerText = `${difficulty} / 5`;
    document.getElementById('val-quiz').innerText = `${quiz}%`;
    document.getElementById('val-confidence').innerText = `${confidence} / 5`;

    runPrediction();
}

function runPrediction() {
    const userEst = parseFloat(document.getElementById('input-hours').value);
    const difficulty = parseInt(document.getElementById('input-difficulty').value);
    const quizScore = parseFloat(document.getElementById('input-quiz').value);
    const confidence = parseInt(document.getElementById('input-confidence').value);

    // Exact PDF Formula: PTTM = User_Est * (1.0 + 0.15*Difficulty - 0.004*Quiz_Score + 0.08*(6-Confidence))
    const factor = 1.0 + (0.15 * difficulty) - (0.004 * quizScore) + (0.08 * (6 - confidence));
    let predictedTTM = Math.round(userEst * factor * 100) / 100;
    predictedTTM = Math.max(0.5, predictedTTM);

    const eer = Math.round((predictedTTM / userEst) * 100) / 100;

    document.getElementById('res-target').innerText = `${userEst.toFixed(1)} hrs`;
    document.getElementById('res-ttm').innerText = `${predictedTTM.toFixed(1)} hrs`;
    document.getElementById('res-eer-label').innerText = `EER Ratio: ${eer}`;

    const riskBadge = document.getElementById('risk-badge');
    const recText = document.getElementById('res-rec');

    riskBadge.className = 'risk-badge';

    if (eer > 1.2) {
        riskBadge.classList.add('burnout');
        riskBadge.innerText = 'Burnout Risk (Severe Underestimation)';
        recText.innerText = `You estimated ${userEst}h, but predicted TTM is ${predictedTTM}h (EER: ${eer}). High risk of stress & rushing! Split this topic into multiple 45-min blocks.`;
    } else if (eer < 0.8) {
        riskBadge.classList.add('procrastination');
        riskBadge.innerText = 'Procrastination Risk (Overestimation)';
        recText.innerText = `You estimated ${userEst}h, but predicted TTM is only ${predictedTTM}h (EER: ${eer}). Topic is easier than you think! Start right now to conquer hesitation.`;
    } else {
        riskBadge.classList.add('balanced');
        riskBadge.innerText = 'Balanced Pacing';
        recText.innerText = `Optimal estimate! Your self-judgment (${userEst}h) closely aligns with realistic mastery time (${predictedTTM}h). Keep up this study cadence.`;
    }
}

function initCharts() {
    // EER Distribution Chart
    const ctx1 = document.getElementById('eerDistributionChart').getContext('2d');
    eerChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Procrastination Risk (EER < 0.8)', 'Balanced Pacing (0.8-1.2)', 'Burnout Risk (EER > 1.2)'],
            datasets: [{
                data: [240, 530, 230],
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } } }
            }
        }
    });

    // Feature Importance Chart
    const ctx2 = document.getElementById('featureImportanceChart').getContext('2d');
    featureChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['User Estimated Hours', 'Subject Difficulty', 'Quiz Score (%)', 'Confidence Level'],
            datasets: [{
                label: 'Relative Importance',
                data: [0.55, 0.22, 0.13, 0.10],
                backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#cbd5e1' }, grid: { display: false } }
            }
        }
    });
}
