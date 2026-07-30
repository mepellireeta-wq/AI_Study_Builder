import os
import sys
import json
from flask import Flask, request, jsonify, render_template_string
from werkzeug.utils import secure_filename
from grader import grade_handwritten_sheet

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChronoSense CV Engine - AI Vision Auto-Grader</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-panel-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-panel-hover:hover {
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);
        }
        .glow-button {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
            box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
        }
        .glow-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 35px rgba(168, 85, 247, 0.6);
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
        }
        .fade-in {
            animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen relative overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-20">

    <!-- Glowing Background Orbs -->
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
    <div class="fixed top-1/3 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
    <div class="fixed bottom-10 left-10 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">

        <!-- Top Header Navigation -->
        <header class="glass-panel rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                        ChronoSense CV Engine
                    </h1>
                    <p class="text-xs text-indigo-400 font-medium tracking-wide">Vision AI Handwritten Test Sheet Auto-Grader</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Gemini 2.5 Vision Active</span>
                </div>
                <div class="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-medium">
                    v2.4 Live
                </div>
            </div>
        </header>

        <!-- Main Workspace -->
        <main class="space-y-8">

            <!-- Interactive Upload Box -->
            <section class="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-lg font-bold text-slate-100">Upload Test Sheet</h2>
                        <p class="text-xs text-slate-400">Select or drop a handwritten sheet image to analyze and grade</p>
                    </div>
                    <span class="text-xs text-slate-500 font-mono">PNG, JPG, JPEG</span>
                </div>

                <form id="uploadForm" class="space-y-6">
                    <!-- Dropzone -->
                    <div id="dropZone" class="group border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 transition-all rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                        
                        <!-- Default Upload View -->
                        <div id="uploadPrompt" class="flex flex-col items-center transition-all group-hover:scale-105">
                            <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                </svg>
                            </div>
                            <p class="text-sm font-semibold text-slate-200">Drag & drop your handwritten test sheet here</p>
                            <p class="text-xs text-slate-500 mt-1">or <span class="text-indigo-400 underline font-medium">browse from your computer</span></p>
                        </div>

                        <!-- Live Image Preview Container -->
                        <div id="previewContainer" class="hidden flex flex-col items-center gap-3 w-full">
                            <div class="relative group/img max-h-56 overflow-hidden rounded-xl border border-indigo-500/40 shadow-xl bg-slate-900 p-1">
                                <img id="imagePreview" src="" alt="Test Sheet Preview" class="max-h-52 object-contain rounded-lg">
                                <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <span class="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg shadow-lg">Change Image</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span id="fileName" class="text-xs font-semibold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800"></span>
                                <button type="button" id="clearFileBtn" class="text-xs text-slate-400 hover:text-rose-400 underline">Remove</button>
                            </div>
                        </div>

                        <input type="file" id="fileInput" name="file" accept="image/*" class="hidden">
                    </div>

                    <!-- Action Button -->
                    <button type="submit" id="submitBtn" class="glow-button w-full py-4 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <span>Analyze & Grade Sheet</span>
                    </button>
                </form>
            </section>

            <!-- Animated Loading Scanner -->
            <div id="loading" class="hidden glass-panel rounded-3xl p-10 text-center fade-in border border-indigo-500/30">
                <div class="relative w-20 h-20 mx-auto mb-6">
                    <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
                    <div class="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center text-indigo-400">
                        <svg class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-slate-100">Scanning & Analyzing Sheet</h3>
                <p id="loadingStatusText" class="text-sm text-indigo-400 font-medium mt-2">Processing image with Gemini Vision AI...</p>
                <div class="w-64 h-1.5 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
                    <div id="progressBar" class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 w-1/3"></div>
                </div>
            </div>

            <!-- WOW Results Dashboard -->
            <section id="resultCard" class="hidden glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl fade-in space-y-8">
                
                <!-- Report Card Header & Animated Score -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Grade Report Complete</span>
                        </div>
                        <h3 class="text-2xl font-black text-slate-100 mt-1">Handwriting Assessment</h3>
                        <p id="engineUsedBadge" class="text-xs text-slate-400 mt-0.5 font-mono">Engine: Gemini 2.5 Vision</p>
                    </div>

                    <!-- Glowing Circular Score Badge -->
                    <div class="relative flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
                        <div class="text-center">
                            <span class="text-xs uppercase font-bold tracking-wider text-slate-400 block">Overall Grade</span>
                            <div class="flex items-baseline justify-center gap-1 mt-1">
                                <span id="scoreNumber" class="text-5xl font-black bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    --
                                </span>
                                <span class="text-lg font-bold text-slate-500">/ 100</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Two Column Topic Breakdown -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Mastered Topics -->
                    <div class="bg-slate-950/80 rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h4 class="text-base font-bold text-slate-100">Mastered Topics</h4>
                            </div>
                            <span id="masteredCount" class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">0 Topics</span>
                        </div>
                        <ul id="masteredList" class="space-y-2.5 text-sm"></ul>
                    </div>

                    <!-- Topics Needing Review -->
                    <div class="bg-slate-950/80 rounded-2xl p-6 border border-amber-500/20 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-base font-bold text-slate-100">Topics Needing Review</h4>
                            </div>
                            <span id="reviewCount" class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">0 Topics</span>
                        </div>
                        <ul id="reviewList" class="space-y-2.5 text-sm"></ul>
                    </div>
                </div>

                <!-- AI Feedback Card -->
                <div class="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 rounded-2xl p-6 border border-indigo-500/30 relative">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">🤖</span>
                            <h4 class="text-sm font-bold text-indigo-300 uppercase tracking-wider">AI Constructive Feedback</h4>
                        </div>
                        <button type="button" id="copyFeedbackBtn" class="text-xs text-indigo-400 hover:text-indigo-200 transition-colors flex items-center gap-1 font-medium bg-indigo-900/40 px-3 py-1 rounded-lg border border-indigo-800">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <span>Copy Summary</span>
                        </button>
                    </div>
                    <p id="feedbackText" class="text-slate-200 text-sm leading-relaxed font-normal"></p>
                </div>

                <!-- Interactive Footer Controls -->
                <div class="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <button type="button" id="toggleJsonBtn" class="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors">
                        [+] Inspect Raw JSON Response
                    </button>
                    <button type="button" id="resetBtn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md">
                        Grade Another Sheet
                    </button>
                </div>

                <!-- Raw JSON Drawer -->
                <div id="jsonDrawer" class="hidden bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <pre id="jsonContent"></pre>
                </div>

            </section>
        </main>
    </div>

    <script>
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const uploadPrompt = document.getElementById('uploadPrompt');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const fileName = document.getElementById('fileName');
        const clearFileBtn = document.getElementById('clearFileBtn');
        
        const uploadForm = document.getElementById('uploadForm');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const loadingStatusText = document.getElementById('loadingStatusText');
        const progressBar = document.getElementById('progressBar');
        
        const resultCard = document.getElementById('resultCard');
        const scoreNumber = document.getElementById('scoreNumber');
        const engineUsedBadge = document.getElementById('engineUsedBadge');
        const masteredList = document.getElementById('masteredList');
        const reviewList = document.getElementById('reviewList');
        const masteredCount = document.getElementById('masteredCount');
        const reviewCount = document.getElementById('reviewCount');
        const feedbackText = document.getElementById('feedbackText');
        const copyFeedbackBtn = document.getElementById('copyFeedbackBtn');
        const toggleJsonBtn = document.getElementById('toggleJsonBtn');
        const jsonDrawer = document.getElementById('jsonDrawer');
        const jsonContent = document.getElementById('jsonContent');
        const resetBtn = document.getElementById('resetBtn');

        let currentRawData = null;

        // Drag and Drop Events
        dropZone.addEventListener('click', () => fileInput.click());

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('border-indigo-500', 'bg-indigo-950/20');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt.files.length) {
                fileInput.files = dt.files;
                handleFileSelect(dt.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });

        function handleFileSelect(file) {
            fileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                uploadPrompt.classList.add('hidden');
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        clearFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.value = '';
            uploadPrompt.classList.remove('hidden');
            previewContainer.classList.add('hidden');
        });

        // Form Submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!fileInput.files.length) {
                alert('Please select a handwritten sheet image first!');
                return;
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            // Show loading scanner
            loading.classList.remove('hidden');
            resultCard.classList.add('hidden');
            submitBtn.disabled = true;

            // Simulated multi-step progress bar
            loadingStatusText.textContent = "Preprocessing handwritten image...";
            progressBar.style.width = "25%";
            
            setTimeout(() => {
                loadingStatusText.textContent = "Scanning handwriting with Gemini Vision AI...";
                progressBar.style.width = "65%";
            }, 800);

            try {
                const response = await fetch('/api/grade', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                currentRawData = data;

                progressBar.style.width = "100%";
                setTimeout(() => {
                    loading.classList.add('hidden');
                    submitBtn.disabled = false;
                    renderResults(data);
                }, 400);

            } catch (err) {
                loading.classList.add('hidden');
                submitBtn.disabled = false;
                alert('Failed to grade image: ' + err.message);
            }
        });

        function renderResults(data) {
            resultCard.classList.remove('hidden');

            // Score animation
            const targetScore = data.score !== undefined ? data.score : 75;
            animateScore(targetScore);

            // Confetti if high score (>80)
            if (targetScore >= 80 && typeof confetti === 'function') {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Engine Badge
            engineUsedBadge.textContent = "Engine: " + (data.fallback ? "EasyOCR Local Fallback" : "Gemini 2.5 Vision Cloud");

            // Render Mastered Topics
            masteredList.innerHTML = '';
            const mastered = data.topics_mastered || ['Handwritten text recognized accurately'];
            masteredCount.textContent = mastered.length + ' Topics';
            mastered.forEach(item => {
                masteredList.innerHTML += `
                    <li class="flex items-center gap-2.5 text-emerald-300 bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-900/50">
                        <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                        <span>${item}</span>
                    </li>`;
            });

            // Render Review Topics
            reviewList.innerHTML = '';
            const review = data.topics_needing_review || ['None identified'];
            reviewCount.textContent = review.length + ' Topics';
            review.forEach(item => {
                reviewList.innerHTML += `
                    <li class="flex items-center gap-2.5 text-amber-300 bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-900/50">
                        <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">!</span>
                        <span>${item}</span>
                    </li>`;
            });

            // Render Feedback
            feedbackText.textContent = data.feedback || data.message || data.extracted_text || 'Grading complete.';

            // Render JSON
            jsonContent.textContent = JSON.stringify(data, null, 2);

            // Smooth scroll to results
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function animateScore(target) {
            let current = 0;
            const duration = 1000;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                scoreNumber.textContent = Math.round(current);
            }, stepTime);
        }

        copyFeedbackBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(feedbackText.textContent);
            copyFeedbackBtn.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                copyFeedbackBtn.querySelector('span').textContent = 'Copy Summary';
            }, 2000);
        });

        toggleJsonBtn.addEventListener('click', () => {
            jsonDrawer.classList.toggle('hidden');
        });

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            uploadPrompt.classList.remove('hidden');
            previewContainer.classList.add('hidden');
            resultCard.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/grade', methods=['POST'])
def grade_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    result = grade_handwritten_sheet(filepath)
    return jsonify(result)

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    print("CV ENGINE ERROR TRACEBACK:")
    traceback.print_exc()
    return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8005))
    print(f"🚀 ChronoSense CV Engine Web Server starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
