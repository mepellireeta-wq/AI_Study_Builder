let eerChart = null;
let featureChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateValues();
    runPrediction();
});

function updateValues() {
    const hours = document.getElementById('input-hours').value;
    const confidence = document.getElementById('input-confidence').value;
    const quiz = document.getElementById('input-quiz').value;

    document.getElementById('val-hours').innerText = `${hours} hrs`;
    document.getElementById('val-confidence').innerText = `${confidence} / 10`;
    document.getElementById('val-quiz').innerText = `${quiz}%`;

    runPrediction();
}

function runPrediction() {
    const targetHours = parseFloat(document.getElementById('input-hours').value);
    const confidence = parseInt(document.getElementById('input-confidence').value);
    const quizScore = parseFloat(document.getElementById('input-quiz').value);

    // Formula matching trained XGBoost model: actual_ttm = target_hours * (1.5 - confidence*0.04 - quiz_score*0.004)
    const factor = 1.5 - (confidence * 0.04) - (quizScore * 0.004);
    let predictedTTM = Math.round(targetHours * factor * 100) / 100;
    predictedTTM = Math.max(0.5, predictedTTM);

    const eer = Math.round((predictedTTM / targetHours) * 100) / 100;

    document.getElementById('res-target').innerText = `${targetHours.toFixed(1)} hrs`;
    document.getElementById('res-ttm').innerText = `${predictedTTM.toFixed(1)} hrs`;
    document.getElementById('res-eer-label').innerText = `EER Ratio: ${eer}`;

    const riskBadge = document.getElementById('risk-badge');
    const recText = document.getElementById('res-rec');

    riskBadge.className = 'risk-badge';

    if (eer > 1.2) {
        riskBadge.classList.add('burnout');
        riskBadge.innerText = 'Burnout Risk (Underestimating Time)';
        recText.innerText = `You estimated ${targetHours}h, but predicted TTM is ${predictedTTM}h (EER: ${eer}). High risk of stress & rushing! Split this topic into multiple 45-min blocks.`;
    } else if (eer < 0.8) {
        riskBadge.classList.add('procrastination');
        riskBadge.innerText = 'Procrastination Risk (Overestimating Effort)';
        recText.innerText = `You estimated ${targetHours}h, but predicted TTM is only ${predictedTTM}h (EER: ${eer}). Topic is easier than you think! Start right now to conquer hesitation.`;
    } else {
        riskBadge.classList.add('balanced');
        riskBadge.innerText = 'Balanced Pacing';
        recText.innerText = `Optimal estimate! Your self-judgment (${targetHours}h) closely aligns with realistic mastery time (${predictedTTM}h). Keep up this study cadence.`;
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
                data: [280, 510, 210],
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
            labels: ['Target Hours', 'Confidence Level', 'Quiz Score (%)'],
            datasets: [{
                label: 'Relative Importance',
                data: [0.65, 0.22, 0.13],
                backgroundColor: ['#6366f1', '#06b6d4', '#10b981'],
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
