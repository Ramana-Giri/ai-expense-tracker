import jwt
from datetime import datetime, timezone

# Decode the token without verification first
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImV4cCI6MTc5NTQ1OTgzN30.lpq-CvTtw7vg70zy-GYZkl0Y589CrBi2pZSdxsjesXc"

# First decode without verification to see contents
decoded = jwt.decode(token, options={"verify_signature": False})
print("Decoded token (without verification):", decoded)

# Check expiration
exp_timestamp = decoded.get('exp')
if exp_timestamp:
    exp_time = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    now = datetime.now(timezone.utc)
    print(f"Expiration time: {exp_time}")
    print(f"Current time: {now}")
    print(f"Is expired? {now > exp_time}")
    
# Try with the secret key we think is being used
secret_key = "your-secret-key-change-in-production"
try:
    verified = jwt.decode(token, secret_key, algorithms=["HS256"])
    print(f"Token verified successfully with secret key: {secret_key}")
    print(f"Verified payload: {verified}")
except jwt.ExpiredSignatureError as e:
    print(f"Token expired: {e}")
except jwt.InvalidSignatureError as e:
    print(f"Invalid signature: {e}")
except Exception as e:
    print(f"Other error: {type(e).__name__}: {e}")
