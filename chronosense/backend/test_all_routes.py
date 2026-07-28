import sys
import os

print("--- STARTING CHRONOSENSE AUTOMATED BUG CHECK ---")

# 1. Test Syntax & Compilation
try:
    import main
    print("[✓] main.py compiled with ZERO syntax errors!")
except Exception as e:
    print(f"[X] main.py compilation error: {e}")

# 2. Test FastAPI Endpoints via TestClient
try:
    from fastapi.testclient import TestClient
    client = TestClient(main.app)

    # Test GET /
    r1 = client.get("/")
    assert r1.status_code == 200
    print(f"[✓] GET / -> HTTP 200 OK | Response: {r1.json()}")

    # Test GET /topics
    r2 = client.get("/topics")
    assert r2.status_code == 200
    print(f"[✓] GET /topics -> HTTP 200 OK | Topics Count: {len(r2.json())}")

    # Test POST /predict-ttm
    r3 = client.post("/predict-ttm", json={
        "target_hours": 10.0,
        "confidence": 5,
        "past_quiz_scores": [75.0, 80.0]
    })
    assert r3.status_code == 200
    print(f"[✓] POST /predict-ttm -> HTTP 200 OK | Status: {r3.json().get('status_code')}")

    # Test GET /analytics/dashboard
    r4 = client.get("/analytics/dashboard")
    assert r4.status_code == 200
    print(f"[✓] GET /analytics/dashboard -> HTTP 200 OK | Pacing Status: {r4.json().get('overall_pacing_status')}")

    print("\n🎉 ALL BACKEND ENDPOINTS PASSED AUTOMATED BUG TEST WITH 100% SUCCESS!")

except Exception as e:
    print(f"[X] Endpoint test error: {e}")
