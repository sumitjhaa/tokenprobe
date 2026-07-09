from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

SAMPLE_TOKEN = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c"
)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_analyze_valid_token():
    r = client.post("/api/analyze", json={"token": SAMPLE_TOKEN})
    assert r.status_code == 200
    data = r.json()
    assert data["token_type"] == "jwt"
    assert data["token_valid_structure"] is True
    assert len(data["findings"]) > 0


def test_analyze_invalid_token():
    r = client.post("/api/analyze", json={"token": "not.a.token"})
    assert r.status_code == 400


def test_config_schema():
    r = client.get("/api/config/schema")
    assert r.status_code == 200
    schema = r.json()
    assert "claims" in schema
    assert "checks" in schema
    assert "severity_overrides" in schema
    assert "custom_rules" in schema


def test_validate_valid_config():
    r = client.post(
        "/api/config/validate",
        json={"config": "[claims]\nrequired = ['sub', 'exp']"},
    )
    assert r.status_code == 200
    assert r.json()["valid"] is True


def test_validate_invalid_config():
    r = client.post(
        "/api/config/validate",
        json={"config": "invalid [[[ toml"},
    )
    assert r.status_code == 200
    assert r.json()["valid"] is False
    assert r.json()["error"] is not None


def test_jwe_endpoint_with_jwt():
    r = client.post("/api/analyze/jwe", json={"token": SAMPLE_TOKEN})
    assert r.status_code == 200
    data = r.json()
    assert data["token_type"] == "jwt"
    assert data["error"] == "Token is not a JWE (expected 5-part structure)"


def test_token_too_long():
    r = client.post("/api/analyze", json={"token": "x" * 100_001})
    assert r.status_code == 422


def test_config_too_long():
    r = client.post("/api/analyze", json={"token": SAMPLE_TOKEN, "config": "x" * 50_001})
    assert r.status_code == 422


def test_token_oversized_after_max():
    r = client.post("/api/analyze", json={"token": "x" * 200_000})
    assert r.status_code in (400, 422)


def test_cors_headers():
    r = client.options("/health", headers={"Origin": "https://example.com"})
    assert "access-control-allow-origin" in r.headers


def test_path_traversal_config():
    r = client.post(
        "/api/config/validate",
        json={"config": "x = 1"},
    )
    assert r.status_code == 200
    assert r.json()["valid"] is True


def test_empty_batch_file():
    r = client.post(
        "/api/analyze/batch",
        files={"file": ("empty.txt", "", "text/plain")},
    )
    assert r.status_code == 400
    assert "No tokens" in r.json()["detail"]


def test_batch_with_json_array():
    import json as _json
    content = _json.dumps([SAMPLE_TOKEN, SAMPLE_TOKEN])
    r = client.post(
        "/api/analyze/batch",
        files={"file": ("tokens.json", content, "application/json")},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["total_tokens"] == 2
    assert data["processed_tokens"] == 2
