from flask import Flask, jsonify, request

app = Flask(__name__)

# Initial Mock Database State
topics_db = [
    { "id": 1, "name": "Data Structures", "target_hours": 10, "completed_hours": 7, "confidence": 6 },
    { "id": 2, "name": "Machine Learning", "target_hours": 15, "completed_hours": 5, "confidence": 4 },
    { "id": 3, "name": "Database Systems", "target_hours": 12, "completed_hours": 10, "confidence": 8 }
]

timeline_db = [
    { "id": 1, "title": "Array & Linked List Review", "date": "2026-07-28", "topic": "Data Structures", "status": "Completed" },
    { "id": 2, "title": "Regression Model Assignment", "date": "2026-07-30", "topic": "Machine Learning", "status": "In Progress" },
    { "id": 3, "title": "SQL Normalization Quiz", "date": "2026-08-02", "topic": "Database Systems", "status": "Upcoming" }
]

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route("/")
def home():
    return jsonify({
        "Project": "AI Study Builder (Chronosense API)",
        "Status": "Running Successfully",
        "Version": "2.0"
    })

@app.route("/api/topics", methods=["GET", "POST"])
def manage_topics():
    global topics_db
    if request.method == "GET":
        return jsonify(topics_db)
    
    data = request.json
    new_topic = {
        "id": int(data.get("id", len(topics_db) + 100)),
        "name": data.get("name", "New Subject"),
        "target_hours": int(data.get("target_hours", 10)),
        "completed_hours": int(data.get("completed_hours", 0)),
        "confidence": int(data.get("confidence", 5))
    }
    topics_db.append(new_topic)
    return jsonify({"success": True, "topic": new_topic}), 201

@app.route("/api/topics/<int:topic_id>", methods=["PUT", "DELETE"])
def topic_detail(topic_id):
    global topics_db
    if request.method == "DELETE":
        topics_db = [t for t in topics_db if t["id"] != topic_id]
        return jsonify({"success": True, "deleted_id": topic_id})
    
    data = request.json
    for t in topics_db:
        if t["id"] == topic_id:
            if "target_hours" in data: t["target_hours"] = int(data["target_hours"])
            if "completed_hours" in data: t["completed_hours"] = float(data["completed_hours"])
            if "confidence" in data: t["confidence"] = int(data["confidence"])
            if "name" in data: t["name"] = data["name"]
            return jsonify({"success": True, "topic": t})
            
    return jsonify({"error": "Topic not found"}), 404

@app.route("/api/timeline", methods=["GET", "POST"])
def manage_timeline():
    global timeline_db
    if request.method == "GET":
        return jsonify(timeline_db)
        
    data = request.json
    new_item = {
        "id": int(data.get("id", len(timeline_db) + 100)),
        "title": data.get("title", "New Assignment"),
        "date": data.get("date", "2026-08-01"),
        "topic": data.get("topic", "General"),
        "status": data.get("status", "Upcoming")
    }
    timeline_db.insert(0, new_item)
    return jsonify({"success": True, "item": new_item}), 201

@app.route("/api/rebalance", methods=["POST"])
def rebalance_schedule():
    global topics_db
    data = request.json or {}
    topics_input = data.get("topics", topics_db)
    
    # AI Rebalancing Logic: Lower confidence topics receive higher target hours
    total_desired_hours = sum(int(t.get("target_hours", 10)) for t in topics_input)
    # Calculate inverse weight based on (11 - confidence)
    weights = [(11 - int(t.get("confidence", 5))) for t in topics_input]
    total_weight = sum(weights) or 1
    
    rebalanced_topics = []
    for t, weight in zip(topics_input, weights):
        new_hours = round((weight / total_weight) * total_desired_hours)
        updated = dict(t)
        updated["target_hours"] = max(2, new_hours) # minimum 2 hours
        rebalanced_topics.append(updated)
        
    topics_db = rebalanced_topics
    return jsonify({
        "success": True, 
        "rebalanced_topics": rebalanced_topics,
        "message": "AI Rebalanced workload successfully!"
    })

@app.route("/api/assignments/upload", methods=["POST"])
def upload_assignment():
    # Mock syllabus parser endpoint
    return jsonify({
        "success": True,
        "parsed_data": {
            "title": "Uploaded Assignment Milestone",
            "suggested_topic": "Data Structures",
            "deadline": "2026-08-05"
        }
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)