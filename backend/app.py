from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "Project":"AI Study Builder",
        "Status":"Running Successfully"
    })


@app.route("/study-plan")
def study_plan():
    return jsonify({
        "Maths":"2 Hours",
        "DBMS":"1 Hour",
        "Python":"1.5 Hours",
        "Break":"30 Minutes"
    })


if __name__=="__main__":
    app.run(debug=True)