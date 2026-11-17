from cryptography.fernet import Fernet
from app.config import get_settings
import base64
import hashlib

settings = get_settings()


def get_encryption_key():
    """Generate a Fernet key from the settings encryption key."""
    # Ensure the key is 32 bytes for Fernet
    key = settings.encryption_key
    if len(key) < 32:
        # Pad with hash if too short
        key = key + hashlib.sha256(key.encode()).hexdigest()[:32 - len(key)]
    else:
        key = key[:32]
    
    # Convert to base64 for Fernet
    key_bytes = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
    return key_bytes


def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return ""
    f = Fernet(get_encryption_key())
    encrypted = f.encrypt(value.encode())
    return encrypted.decode()


def decrypt_value(encrypted_value: str) -> str:
    """Decrypt an encrypted string value."""
    if not encrypted_value:
        return ""
    try:
        f = Fernet(get_encryption_key())
        decrypted = f.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except Exception as e:
        # If decryption fails, return empty string
        return ""
