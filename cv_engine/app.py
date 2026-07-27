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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChronoSense - CV Auto-Grader Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 md:p-12">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between pb-8 border-b border-slate-800">
            <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ChronoSense CV Engine
                </h1>
                <p class="text-slate-400 text-sm mt-1">Handwritten Test Sheet Vision AI Auto-Grader</p>
            </div>
            <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                ● Engine Online
            </span>
        </div>

        <!-- Main Upload Card -->
        <div class="mt-8 bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
            <h2 class="text-xl font-semibold mb-4 text-slate-200">Upload Handwritten Sheet</h2>
            
            <form id="uploadForm" class="space-y-6">
                <div id="dropZone" class="border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-colors rounded-xl p-8 text-center cursor-pointer bg-slate-950/40">
                    <svg class="mx-auto h-12 w-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-slate-300 font-medium">Click or drag & drop handwritten test sheet image</p>
                    <p class="text-slate-500 text-xs mt-1">Supports PNG, JPG, JPEG (Max 16MB)</p>
                    <input type="file" id="fileInput" name="file" accept="image/*" class="hidden">
                    <p id="fileName" class="text-indigo-400 text-sm mt-3 font-semibold"></p>
                </div>

                <button type="submit" id="submitBtn" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                    Analyze & Grade Sheet
                </button>
            </form>
        </div>

        <!-- Loading Indicator -->
        <div id="loading" class="hidden mt-8 text-center p-8 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
            <p class="text-slate-300 font-medium">Analyzing handwriting with Gemini Vision AI...</p>
        </div>

        <!-- Results Card -->
        <div id="resultCard" class="hidden mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div class="flex items-center justify-between pb-6 border-b border-slate-800">
                <h3 class="text-xl font-bold text-slate-100">Grading Report Card</h3>
                <div id="scoreBadge" class="text-3xl font-extrabold px-4 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    -- / 100
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <!-- Mastered Topics -->
                <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    <h4 class="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Mastered Topics</h4>
                    <ul id="masteredList" class="space-y-2 text-slate-300 text-sm"></ul>
                </div>

                <!-- Topics Needing Review -->
                <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    <h4 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Topics Needing Review</h4>
                    <ul id="reviewList" class="space-y-2 text-slate-300 text-sm"></ul>
                </div>
            </div>

            <!-- Feedback -->
            <div class="mt-6 bg-indigo-950/30 border border-indigo-900/40 p-5 rounded-xl">
                <h4 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">AI Feedback Summary</h4>
                <p id="feedbackText" class="text-slate-200 text-sm leading-relaxed"></p>
            </div>
        </div>
    </div>

    <script>
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName');
        const uploadForm = document.getElementById('uploadForm');
        const loading = document.getElementById('loading');
        const resultCard = document.getElementById('resultCard');

        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                fileName.textContent = 'Selected: ' + e.target.files[0].name;
            }
        });

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!fileInput.files.length) {
                alert('Please select an image file first!');
                return;
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            loading.classList.remove('hidden');
            resultCard.classList.add('hidden');

            try {
                const response = await fetch('/api/grade', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                loading.classList.add('hidden');
                resultCard.classList.remove('hidden');

                if (data.score !== undefined) {
                    document.getElementById('scoreBadge').textContent = data.score + ' / 100';
                } else {
                    document.getElementById('scoreBadge').textContent = 'OCR Result';
                }

                // Render Mastered Topics
                const masteredList = document.getElementById('masteredList');
                masteredList.innerHTML = '';
                const mastered = data.topics_mastered || ['Handwritten text recognized'];
                mastered.forEach(item => {
                    masteredList.innerHTML += `<li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> ${item}</li>`;
                });

                // Render Review Topics
                const reviewList = document.getElementById('reviewList');
                reviewList.innerHTML = '';
                const review = data.topics_needing_review || ['None identified'];
                review.forEach(item => {
                    reviewList.innerHTML += `<li class="flex items-center gap-2"><span class="text-amber-400">⚠</span> ${item}</li>`;
                });

                // Render Feedback
                document.getElementById('feedbackText').textContent = data.feedback || data.message || data.extracted_text || 'Analysis complete.';

            } catch (err) {
                loading.classList.add('hidden');
                alert('Failed to analyze image: ' + err.message);
            }
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

if __name__ == '__main__':
    print("🚀 ChronoSense CV Engine Web Server starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
