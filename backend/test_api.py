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
