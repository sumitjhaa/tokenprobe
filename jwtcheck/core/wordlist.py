"""
Built-in wordlist of common weak JWT secrets.

This list contains commonly-used weak secrets for HS256 JWT signing.
It is NOT sourced from breach data — these are well-known weak defaults
and common patterns found in documentation and tutorials.

Use this for the weak_secret_bruteforce active check only.
"""

COMMON_SECRETS = [
    "secret",
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "master",
    "dragon",
    "111111",
    "baseball",
    "iloveyou",
    "trustno1",
    "sunshine",
    "ashley",
    "football",
    "shadow",
    "123123",
    "654321",
    "superman",
    "qazwsx",
    "michael",
    "password1",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "login",
    "princess",
    "starwars",
    "solo",
    "qwerty123",
    "1q2w3e4r",
    "passw0rd",
    "hello",
    "charlie",
    "donald",
    "batman",
    "access",
    "thunder",
    "matrix",
    "love",
    "test",
    "test123",
    "root",
    "toor",
    "pass",
    "passwd",
    "guest",
    "default",
]


def get_wordlist() -> list[str]:
    """Return the list of common weak secrets."""
    return COMMON_SECRETS.copy()


def wordlist_size() -> int:
    """Return the number of secrets in the wordlist."""
    return len(COMMON_SECRETS)
