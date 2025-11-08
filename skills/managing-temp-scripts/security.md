# Security Best Practices for Temporary Scripts

## Security Overview

Temporary scripts pose unique security challenges because they:
- Often handle sensitive data (API keys, credentials, user data)
- Execute with the same privileges as the parent process
- May be automatically deleted, making post-incident analysis difficult
- Are frequently created on-the-fly, bypassing normal code review processes
- Can introduce vulnerabilities if not properly secured

**Key Principle**: Treat temporary scripts with the same security rigor as production code, even if they only run once.

## Credential Management

### Passing API Keys Safely

**Never hardcode credentials in script files:**

```python
# BAD - Hardcoded credentials
API_KEY = "sk-1234567890abcdef"

# GOOD - Environment variable
import os
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise ValueError("API_KEY environment variable required")
```

**Preferred methods (from most to least secure):**

1. **System Keychain** (most secure for local development)
2. **Environment variables** (good for temporary use)
3. **Encrypted files** (when persistence is needed)
4. **Command-line arguments** (least secure, visible in process lists)

### Using System Keychain

```python
# Secure credential storage using keyring
import keyring

# Store credential (one-time setup)
keyring.set_password("my_service", "api_key", "sk-1234567890")

# Retrieve in script
api_key = keyring.get_password("my_service", "api_key")
if not api_key:
    raise ValueError("API key not found in keychain")
```

### Encrypting Sensitive Data

```python
from cryptography.fernet import Fernet
import os

def encrypt_credential(credential, key_file=".key"):
    """Encrypt credential and save key"""
    key = Fernet.generate_key()
    f = Fernet(key)
    encrypted = f.encrypt(credential.encode())

    # Save key with restrictive permissions
    with open(key_file, 'wb') as kf:
        kf.write(key)
    os.chmod(key_file, 0o600)

    return encrypted

def decrypt_credential(encrypted, key_file=".key"):
    """Decrypt credential"""
    with open(key_file, 'rb') as kf:
        key = kf.read()
    f = Fernet(key)
    return f.decrypt(encrypted).decode()
```

### Avoiding Hardcoded Credentials

**Bad practices:**
```python
# Visible in code
PASSWORD = "mysecret123"

# Visible in version control
config = {"api_key": "sk-1234"}

# Visible in logs
print(f"Using API key: {api_key}")
```

**Good practices:**
```python
# Load from secure source
import os
PASSWORD = os.environ.get('PASSWORD')

# Use configuration files with .gitignore
import json
with open('.credentials.json') as f:
    config = json.load(f)

# Redact in logs
print(f"Using API key: {api_key[:8]}...")
```

### Credential Cleanup

```python
import os
import gc

def cleanup_credentials():
    """Securely cleanup credentials after use"""
    # Clear environment variables
    for var in ['API_KEY', 'PASSWORD', 'TOKEN']:
        if var in os.environ:
            os.environ[var] = ''
            del os.environ[var]

    # Force garbage collection
    gc.collect()

    # Delete credential files
    for cred_file in ['.credentials.json', '.key']:
        if os.path.exists(cred_file):
            # Overwrite before deletion
            with open(cred_file, 'wb') as f:
                f.write(os.urandom(os.path.getsize(cred_file)))
            os.remove(cred_file)
```

## File Permissions

### Setting Restrictive Permissions

```bash
# Scripts should be executable only by owner
chmod 700 script.py  # rwx------

# Data files should be readable/writable only by owner
chmod 600 data.json  # rw-------

# Temporary directories
chmod 700 temp_dir/  # rwx------
```

```python
import os
import stat

# Set permissions when creating files
def create_secure_file(filepath, content):
    """Create file with secure permissions"""
    # Create file
    with open(filepath, 'w') as f:
        f.write(content)

    # Set restrictive permissions (owner read/write only)
    os.chmod(filepath, stat.S_IRUSR | stat.S_IWUSR)  # 600

# Set permissions when creating directories
def create_secure_dir(dirpath):
    """Create directory with secure permissions"""
    os.makedirs(dirpath, mode=0o700, exist_ok=True)
```

### Temp Directory Security

```python
import tempfile
import os
import shutil

def create_secure_temp_dir():
    """Create secure temporary directory"""
    # Create with secure permissions
    temp_dir = tempfile.mkdtemp(prefix='secure_')
    os.chmod(temp_dir, 0o700)

    return temp_dir

def secure_temp_file():
    """Create secure temporary file"""
    # mkstemp creates file with 600 permissions by default
    fd, path = tempfile.mkstemp(prefix='secure_', suffix='.dat')
    os.close(fd)
    return path
```

## Input Validation

### Validating User Input

```python
import re
import os.path

def validate_filename(filename):
    """Validate filename to prevent path traversal"""
    # Check for path traversal attempts
    if '..' in filename or filename.startswith('/'):
        raise ValueError("Invalid filename: path traversal detected")

    # Allow only alphanumeric, dash, underscore, dot
    if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
        raise ValueError("Invalid filename: contains illegal characters")

    return filename

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    return email

def validate_number(value, min_val=None, max_val=None):
    """Validate numeric input with bounds"""
    try:
        num = float(value)
    except (ValueError, TypeError):
        raise ValueError("Invalid number format")

    if min_val is not None and num < min_val:
        raise ValueError(f"Value must be >= {min_val}")
    if max_val is not None and num > max_val:
        raise ValueError(f"Value must be <= {max_val}")

    return num
```

### Sanitizing Command-Line Arguments

```python
import shlex
import subprocess

def safe_command_execution(user_input):
    """Safely execute command with user input"""
    # BAD - Command injection vulnerability
    # os.system(f"process {user_input}")

    # GOOD - Use list form with validated input
    allowed_commands = {'list', 'show', 'export'}
    if user_input not in allowed_commands:
        raise ValueError(f"Invalid command: {user_input}")

    subprocess.run(['process', user_input], check=True)

def sanitize_shell_arg(arg):
    """Sanitize argument for shell command"""
    # Use shlex.quote to escape special characters
    return shlex.quote(str(arg))
```

### Preventing Injection Attacks

```python
import sqlite3

def safe_database_query(user_id):
    """Safe database query preventing SQL injection"""
    # BAD - SQL injection vulnerability
    # cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

    # GOOD - Use parameterized queries
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return cursor.fetchall()

def safe_template_rendering(template, user_data):
    """Safe template rendering preventing XSS"""
    import html

    # Escape all user data
    safe_data = {k: html.escape(str(v)) for k, v in user_data.items()}

    return template.format(**safe_data)
```

### Input Whitelisting

```python
def validate_with_whitelist(value, allowed_values):
    """Validate input against whitelist"""
    if value not in allowed_values:
        raise ValueError(f"Invalid value. Allowed: {allowed_values}")
    return value

# Example usage
ALLOWED_FORMATS = {'json', 'csv', 'xml'}
output_format = validate_with_whitelist(user_input, ALLOWED_FORMATS)

ALLOWED_ACTIONS = {'create', 'read', 'update', 'delete'}
action = validate_with_whitelist(user_action, ALLOWED_ACTIONS)
```

## Output Sanitization

### Validating Script Output

```python
import json

def validate_json_output(output):
    """Validate that output is valid JSON"""
    try:
        data = json.loads(output)
        return data
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON output: {e}")

def validate_output_structure(data, expected_keys):
    """Validate output has expected structure"""
    if not isinstance(data, dict):
        raise ValueError("Output must be a dictionary")

    missing_keys = set(expected_keys) - set(data.keys())
    if missing_keys:
        raise ValueError(f"Missing required keys: {missing_keys}")

    return data
```

### Limiting Output Size

```python
def limit_output_size(output, max_bytes=1_000_000):
    """Limit output size to prevent memory exhaustion"""
    if len(output) > max_bytes:
        raise ValueError(f"Output exceeds {max_bytes} bytes")
    return output

def truncate_output(output, max_lines=1000):
    """Truncate output to maximum number of lines"""
    lines = output.split('\n')
    if len(lines) > max_lines:
        truncated = '\n'.join(lines[:max_lines])
        return truncated + f"\n... (truncated {len(lines) - max_lines} lines)"
    return output
```

### Escaping Special Characters

```python
import html
import re

def escape_html(text):
    """Escape HTML special characters"""
    return html.escape(text)

def escape_shell_output(text):
    """Remove potentially dangerous characters from shell output"""
    # Remove control characters except newline and tab
    return re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', text)

def sanitize_log_output(text):
    """Sanitize text for safe logging"""
    # Remove ANSI escape codes
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)
```

### Removing Sensitive Data from Output

```python
import re

def redact_sensitive_data(text):
    """Redact sensitive data from output"""
    # Redact email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                  '[EMAIL REDACTED]', text)

    # Redact API keys (common patterns)
    text = re.sub(r'sk-[a-zA-Z0-9]{32,}', '[API_KEY REDACTED]', text)
    text = re.sub(r'Bearer [a-zA-Z0-9._-]+', 'Bearer [TOKEN REDACTED]', text)

    # Redact credit card numbers
    text = re.sub(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',
                  '[CARD REDACTED]', text)

    # Redact IP addresses
    text = re.sub(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
                  '[IP REDACTED]', text)

    return text
```

## Dependency Security

### Using Virtual Environments

```bash
# Always use virtual environments for isolation
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```

```python
# Check if running in virtual environment
import sys

def ensure_virtualenv():
    """Ensure script runs in virtual environment"""
    if not hasattr(sys, 'real_prefix') and not hasattr(sys, 'base_prefix'):
        raise RuntimeError("Script must run in virtual environment")

    if sys.prefix == sys.base_prefix:
        raise RuntimeError("Script must run in virtual environment")
```

### Pinning Exact Versions

```txt
# requirements.txt - Pin exact versions
requests==2.31.0
cryptography==41.0.7
keyring==24.3.0

# NOT this - allows any version
# requests
# cryptography
# keyring
```

```bash
# Generate requirements.txt with pinned versions
pip freeze > requirements.txt

# Install exact versions
pip install -r requirements.txt
```

### Checking for Vulnerabilities

```bash
# Python - Use pip-audit
pip install pip-audit
pip-audit

# Or use safety
pip install safety
safety check

# Node.js - Use npm audit
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

```python
# Automate vulnerability checking in script
import subprocess
import sys

def check_dependencies():
    """Check dependencies for vulnerabilities before execution"""
    try:
        result = subprocess.run(
            ['pip-audit', '--strict'],
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode != 0:
            print("WARNING: Vulnerabilities found in dependencies:")
            print(result.stdout)
            response = input("Continue anyway? (yes/no): ")
            if response.lower() != 'yes':
                sys.exit(1)
    except FileNotFoundError:
        print("pip-audit not installed. Install with: pip install pip-audit")
```

### Avoiding Global Package Installations

```bash
# BAD - Installs globally, affects system
pip install package

# GOOD - Install in virtual environment
python -m venv .venv
source .venv/bin/activate
pip install package

# BETTER - Use pipx for CLI tools
pipx install package
```

## Execution Security

### Running with Minimal Privileges

```python
import os
import pwd
import grp

def drop_privileges(user='nobody', group='nogroup'):
    """Drop to lower privilege user (Unix only)"""
    if os.getuid() != 0:
        # Not running as root, no need to drop privileges
        return

    # Get the uid/gid from the name
    running_uid = pwd.getpwnam(user).pw_uid
    running_gid = grp.getgrnam(group).gr_gid

    # Remove group privileges
    os.setgroups([])

    # Try setting the new uid/gid
    os.setgid(running_gid)
    os.setuid(running_uid)

    # Ensure a reasonable umask
    os.umask(0o077)
```

### Using Timeouts

```python
import subprocess
import signal
from contextlib import contextmanager

def run_with_timeout(command, timeout=30):
    """Execute command with timeout"""
    try:
        result = subprocess.run(
            command,
            timeout=timeout,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"Command timed out after {timeout} seconds")

@contextmanager
def time_limit(seconds):
    """Context manager for time limits"""
    def signal_handler(signum, frame):
        raise TimeoutError(f"Timed out after {seconds} seconds")

    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

# Usage
try:
    with time_limit(10):
        # Your code here
        slow_operation()
except TimeoutError as e:
    print(f"Operation timed out: {e}")
```

### Sandboxing with Docker

```dockerfile
# Dockerfile for sandboxed script execution
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 scriptuser

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy script
COPY script.py .

# Switch to non-root user
USER scriptuser

# Set resource limits in docker-compose or run command
CMD ["python", "script.py"]
```

```bash
# Run with resource limits
docker run --rm \
  --memory="256m" \
  --cpus="0.5" \
  --network="none" \
  --read-only \
  --tmpfs /tmp \
  my-script
```

### Resource Limits

```python
import resource

def set_resource_limits():
    """Set resource limits for script execution"""
    # Limit CPU time (seconds)
    resource.setrlimit(resource.RLIMIT_CPU, (60, 60))

    # Limit memory (bytes) - 256MB
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))

    # Limit file size (bytes) - 10MB
    resource.setrlimit(resource.RLIMIT_FSIZE, (10 * 1024 * 1024, 10 * 1024 * 1024))

    # Limit number of open files
    resource.setrlimit(resource.RLIMIT_NOFILE, (100, 100))
```

## Network Security

### HTTPS Only for API Calls

```python
import requests
from urllib.parse import urlparse

def validate_https_url(url):
    """Ensure URL uses HTTPS"""
    parsed = urlparse(url)
    if parsed.scheme != 'https':
        raise ValueError(f"Only HTTPS URLs allowed, got: {parsed.scheme}")
    return url

def secure_api_call(url, **kwargs):
    """Make API call with security checks"""
    # Validate HTTPS
    validate_https_url(url)

    # Enforce certificate verification
    kwargs['verify'] = True

    # Set timeout to prevent hanging
    kwargs.setdefault('timeout', 30)

    response = requests.get(url, **kwargs)
    response.raise_for_status()

    return response.json()
```

### Certificate Verification

```python
import requests
import certifi

def api_call_with_cert_verification(url):
    """API call with explicit certificate verification"""
    # Use certifi's certificate bundle
    response = requests.get(
        url,
        verify=certifi.where(),  # Explicit cert bundle
        timeout=30
    )
    return response

# NEVER do this in production
def insecure_call(url):
    """Example of what NOT to do"""
    # BAD - Disables certificate verification
    # response = requests.get(url, verify=False)
    pass
```

### Rate Limiting

```python
import time
from functools import wraps
from collections import deque

class RateLimiter:
    """Simple rate limiter"""
    def __init__(self, max_calls, period):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()

    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()

            # Remove old calls outside the period
            while self.calls and self.calls[0] < now - self.period:
                self.calls.popleft()

            # Check if we've exceeded rate limit
            if len(self.calls) >= self.max_calls:
                sleep_time = self.period - (now - self.calls[0])
                if sleep_time > 0:
                    time.sleep(sleep_time)
                    self.calls.popleft()

            # Record this call
            self.calls.append(time.time())

            return func(*args, **kwargs)
        return wrapper

# Usage: max 10 calls per minute
@RateLimiter(max_calls=10, period=60)
def api_call(endpoint):
    return requests.get(endpoint)
```

### Proxy Configuration

```python
import os
import requests

def get_proxy_config():
    """Get proxy configuration from environment"""
    proxies = {}

    http_proxy = os.environ.get('HTTP_PROXY') or os.environ.get('http_proxy')
    https_proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')

    if http_proxy:
        proxies['http'] = http_proxy
    if https_proxy:
        proxies['https'] = https_proxy

    return proxies

def api_call_with_proxy(url):
    """Make API call respecting proxy settings"""
    proxies = get_proxy_config()
    response = requests.get(url, proxies=proxies, timeout=30)
    return response
```

## Cleanup Security

### Secure File Deletion

```python
import os
import shutil

def secure_delete_file(filepath, passes=3):
    """Securely delete file by overwriting before removal"""
    if not os.path.exists(filepath):
        return

    file_size = os.path.getsize(filepath)

    # Overwrite file multiple times
    with open(filepath, 'wb') as f:
        for _ in range(passes):
            f.seek(0)
            f.write(os.urandom(file_size))
            f.flush()
            os.fsync(f.fileno())

    # Finally remove the file
    os.remove(filepath)

def secure_delete_directory(dirpath):
    """Securely delete directory and all contents"""
    if not os.path.exists(dirpath):
        return

    # Walk through and securely delete all files
    for root, dirs, files in os.walk(dirpath, topdown=False):
        for name in files:
            secure_delete_file(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))

    # Remove the directory itself
    os.rmdir(dirpath)
```

### Memory Cleanup

```python
import gc
import ctypes

def secure_string_cleanup(sensitive_str):
    """Attempt to clear sensitive string from memory"""
    # Python strings are immutable, but we can try to clear references
    # This is not guaranteed to work in all cases

    # Get the memory address
    str_addr = id(sensitive_str)

    # Overwrite the string object's data
    # WARNING: This is CPython-specific and dangerous
    try:
        # Zero out the string data
        ctypes.memset(str_addr, 0, len(sensitive_str))
    except:
        pass

    # Delete reference and force garbage collection
    del sensitive_str
    gc.collect()

def cleanup_sensitive_variables(*var_names):
    """Cleanup sensitive variables from local scope"""
    import sys

    frame = sys._getframe(1)
    for var_name in var_names:
        if var_name in frame.f_locals:
            del frame.f_locals[var_name]

    gc.collect()
```

### Log Sanitization

```python
import re
import logging

class SanitizingFormatter(logging.Formatter):
    """Custom formatter that sanitizes sensitive data"""

    PATTERNS = [
        (re.compile(r'sk-[a-zA-Z0-9]{32,}'), '[API_KEY]'),
        (re.compile(r'Bearer [a-zA-Z0-9._-]+'), 'Bearer [TOKEN]'),
        (re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'), '[EMAIL]'),
        (re.compile(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'), '[CARD]'),
    ]

    def format(self, record):
        # Format the message
        msg = super().format(record)

        # Apply sanitization patterns
        for pattern, replacement in self.PATTERNS:
            msg = pattern.sub(replacement, msg)

        return msg

# Setup sanitizing logger
def setup_secure_logging():
    """Setup logging with sanitization"""
    handler = logging.StreamHandler()
    handler.setFormatter(SanitizingFormatter('%(asctime)s - %(levelname)s - %(message)s'))

    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    return logger
```

## Common Vulnerabilities

### Command Injection

**Vulnerability:**
```python
# UNSAFE - User input directly in shell command
import os
user_file = input("Enter filename: ")
os.system(f"cat {user_file}")  # User can enter: "file.txt; rm -rf /"
```

**Prevention:**
```python
# SAFE - Use subprocess with list arguments
import subprocess
user_file = input("Enter filename: ")

# Validate filename
if '..' in user_file or '/' in user_file:
    raise ValueError("Invalid filename")

# Use list form, not shell=True
subprocess.run(['cat', user_file], check=True)
```

### Path Traversal

**Vulnerability:**
```python
# UNSAFE - User can access arbitrary files
import os
filename = input("Enter file: ")
with open(f"/var/data/{filename}") as f:  # User enters: "../../etc/passwd"
    print(f.read())
```

**Prevention:**
```python
# SAFE - Validate and resolve path
import os
from pathlib import Path

def safe_file_access(filename, base_dir="/var/data"):
    """Safely access file within base directory"""
    # Remove any path components
    filename = os.path.basename(filename)

    # Build full path
    full_path = Path(base_dir) / filename

    # Resolve to absolute path
    resolved = full_path.resolve()

    # Ensure it's within base directory
    if not str(resolved).startswith(str(Path(base_dir).resolve())):
        raise ValueError("Path traversal detected")

    return resolved
```

### Arbitrary Code Execution

**Vulnerability:**
```python
# UNSAFE - Executing arbitrary code
user_code = input("Enter Python expression: ")
result = eval(user_code)  # User can enter: "__import__('os').system('rm -rf /')"
```

**Prevention:**
```python
# SAFE - Use ast.literal_eval for data only
import ast

user_code = input("Enter Python literal: ")
try:
    # Only allows literals (strings, numbers, dicts, lists, etc.)
    result = ast.literal_eval(user_code)
except (ValueError, SyntaxError):
    raise ValueError("Invalid literal expression")

# Or use a whitelist of safe operations
SAFE_OPERATIONS = {'+', '-', '*', '/', '(', ')', ' ', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'}

def is_safe_expression(expr):
    """Check if expression contains only safe characters"""
    return all(c in SAFE_OPERATIONS for c in expr)
```

### Environment Variable Leakage

**Vulnerability:**
```python
# UNSAFE - Exposing environment variables
import os
print(os.environ)  # Prints all environment variables including secrets

# UNSAFE - Logging environment
import logging
logging.info(f"Environment: {dict(os.environ)}")
```

**Prevention:**
```python
# SAFE - Only access specific variables
import os

def get_safe_env_var(name, default=None):
    """Get environment variable safely"""
    return os.environ.get(name, default)

# SAFE - Sanitize environment before logging
SAFE_ENV_VARS = {'PATH', 'HOME', 'USER', 'LANG'}

def get_safe_environment():
    """Get sanitized environment for logging"""
    return {k: v for k, v in os.environ.items() if k in SAFE_ENV_VARS}

# SAFE - Clear sensitive variables before subprocess
import subprocess

def run_subprocess_safely(command):
    """Run subprocess with sanitized environment"""
    safe_env = get_safe_environment()
    subprocess.run(command, env=safe_env, check=True)
```

## Security Checklist

### Pre-Execution Checks

```python
def pre_execution_security_check():
    """Run security checks before script execution"""
    checks = []

    # 1. Check file permissions
    import os
    import stat

    script_path = __file__
    st = os.stat(script_path)
    if st.st_mode & stat.S_IWGRP or st.st_mode & stat.S_IWOTH:
        checks.append("WARNING: Script is writable by group/others")

    # 2. Check for virtual environment
    import sys
    if sys.prefix == sys.base_prefix:
        checks.append("WARNING: Not running in virtual environment")

    # 3. Check for required environment variables
    required_vars = ['API_KEY']
    for var in required_vars:
        if var not in os.environ:
            checks.append(f"ERROR: Required environment variable {var} not set")

    # 4. Check dependencies for vulnerabilities (if pip-audit available)
    try:
        import subprocess
        result = subprocess.run(['pip-audit', '--strict'],
                              capture_output=True, check=False)
        if result.returncode != 0:
            checks.append("WARNING: Vulnerabilities found in dependencies")
    except FileNotFoundError:
        checks.append("INFO: pip-audit not available for vulnerability check")

    # 5. Check write permissions on temp directory
    import tempfile
    temp_dir = tempfile.gettempdir()
    if not os.access(temp_dir, os.W_OK):
        checks.append("ERROR: No write permission on temp directory")

    return checks
```

### During Execution Monitoring

```python
import time
import psutil
import os

class ExecutionMonitor:
    """Monitor script execution for security issues"""

    def __init__(self, max_memory_mb=256, max_cpu_percent=50):
        self.max_memory = max_memory_mb * 1024 * 1024
        self.max_cpu = max_cpu_percent
        self.start_time = time.time()
        self.process = psutil.Process(os.getpid())

    def check_resources(self):
        """Check if resource limits are exceeded"""
        issues = []

        # Check memory usage
        mem_info = self.process.memory_info()
        if mem_info.rss > self.max_memory:
            issues.append(f"Memory limit exceeded: {mem_info.rss / 1024 / 1024:.1f}MB")

        # Check CPU usage
        cpu_percent = self.process.cpu_percent(interval=1)
        if cpu_percent > self.max_cpu:
            issues.append(f"CPU limit exceeded: {cpu_percent:.1f}%")

        # Check for too many open files
        num_fds = self.process.num_fds() if hasattr(self.process, 'num_fds') else 0
        if num_fds > 100:
            issues.append(f"Too many open files: {num_fds}")

        return issues

    def get_stats(self):
        """Get execution statistics"""
        return {
            'runtime': time.time() - self.start_time,
            'memory_mb': self.process.memory_info().rss / 1024 / 1024,
            'cpu_percent': self.process.cpu_percent(),
        }
```

### Post-Execution Cleanup

```python
def post_execution_cleanup():
    """Cleanup after script execution"""
    import os
    import tempfile
    import shutil

    cleanup_steps = []

    # 1. Remove temporary files
    temp_dir = tempfile.gettempdir()
    temp_files = [f for f in os.listdir(temp_dir) if f.startswith('script_')]
    for temp_file in temp_files:
        try:
            path = os.path.join(temp_dir, temp_file)
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
            cleanup_steps.append(f"Removed: {temp_file}")
        except Exception as e:
            cleanup_steps.append(f"Failed to remove {temp_file}: {e}")

    # 2. Clear environment variables
    sensitive_vars = ['API_KEY', 'PASSWORD', 'TOKEN']
    for var in sensitive_vars:
        if var in os.environ:
            del os.environ[var]
            cleanup_steps.append(f"Cleared env var: {var}")

    # 3. Force garbage collection
    import gc
    gc.collect()
    cleanup_steps.append("Forced garbage collection")

    # 4. Clear Python cache
    import sys
    if hasattr(sys, 'modules'):
        # Remove imported modules (careful with this)
        modules_to_remove = [m for m in sys.modules if m.startswith('temp_')]
        for module in modules_to_remove:
            del sys.modules[module]
            cleanup_steps.append(f"Removed module: {module}")

    return cleanup_steps
```

## Examples

### Example 1: Secure API Client with Keyring

```python
#!/usr/bin/env python3
"""
Secure API client using system keyring for credential storage
"""
import keyring
import requests
import sys
from urllib.parse import urlparse

SERVICE_NAME = "my_api_service"

def get_api_key():
    """Retrieve API key from system keyring"""
    api_key = keyring.get_password(SERVICE_NAME, "api_key")
    if not api_key:
        print("API key not found. Setting up...")
        api_key = input("Enter your API key: ")
        keyring.set_password(SERVICE_NAME, "api_key", api_key)
        print("API key stored securely in system keychain")
    return api_key

def validate_url(url):
    """Ensure URL is HTTPS"""
    parsed = urlparse(url)
    if parsed.scheme != 'https':
        raise ValueError("Only HTTPS URLs are allowed")
    return url

def secure_api_call(endpoint, params=None):
    """Make secure API call"""
    # Get credentials securely
    api_key = get_api_key()

    # Validate URL
    url = validate_url(endpoint)

    # Make request with security settings
    headers = {'Authorization': f'Bearer {api_key}'}

    try:
        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=30,
            verify=True  # Enforce certificate verification
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API call failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    try:
        data = secure_api_call('https://api.example.com/data')
        print(f"Retrieved {len(data)} records")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
```

### Example 2: Sandboxed Data Processor

```python
#!/usr/bin/env python3
"""
Sandboxed data processor with resource limits
"""
import os
import sys
import resource
import tempfile
import json
from pathlib import Path

def set_resource_limits():
    """Set strict resource limits"""
    # CPU time: 5 minutes
    resource.setrlimit(resource.RLIMIT_CPU, (300, 300))

    # Memory: 256MB
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))

    # File size: 50MB
    resource.setrlimit(resource.RLIMIT_FSIZE, (50 * 1024 * 1024, 50 * 1024 * 1024))

    # Number of open files: 50
    resource.setrlimit(resource.RLIMIT_NOFILE, (50, 50))

def validate_input_file(filepath, allowed_dir):
    """Validate input file is within allowed directory"""
    # Resolve to absolute path
    file_path = Path(filepath).resolve()
    allowed_path = Path(allowed_dir).resolve()

    # Check if file is within allowed directory
    try:
        file_path.relative_to(allowed_path)
    except ValueError:
        raise ValueError(f"File must be within {allowed_dir}")

    # Check file size (max 10MB)
    if file_path.stat().st_size > 10 * 1024 * 1024:
        raise ValueError("File too large (max 10MB)")

    return file_path

def process_data(input_file, output_file):
    """Process data with security checks"""
    # Validate input
    safe_input = validate_input_file(input_file, '/tmp/safe_input')

    # Read and validate JSON
    with open(safe_input, 'r') as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Input must be a JSON array")

    # Process data (example: filter and transform)
    processed = []
    for item in data[:1000]:  # Limit to 1000 items
        if isinstance(item, dict) and 'value' in item:
            processed.append({
                'value': item['value'],
                'processed': True
            })

    # Write to secure temporary file
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        json.dump(processed, f, indent=2)
        temp_output = f.name

    # Set secure permissions
    os.chmod(temp_output, 0o600)

    # Move to final location
    os.rename(temp_output, output_file)

    return len(processed)

if __name__ == '__main__':
    try:
        # Set resource limits
        set_resource_limits()

        # Process data
        if len(sys.argv) != 3:
            print("Usage: processor.py <input.json> <output.json>")
            sys.exit(1)

        count = process_data(sys.argv[1], sys.argv[2])
        print(f"Processed {count} items successfully")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
```

### Example 3: Secure Credential Passing

```python
#!/usr/bin/env python3
"""
Secure credential passing using encrypted files
"""
import os
import sys
import json
from cryptography.fernet import Fernet
from pathlib import Path
import stat

class SecureCredentials:
    """Manage encrypted credentials"""

    def __init__(self, cred_dir='.credentials'):
        self.cred_dir = Path(cred_dir)
        self.key_file = self.cred_dir / '.key'
        self.cred_file = self.cred_dir / 'credentials.enc'
        self._ensure_directory()

    def _ensure_directory(self):
        """Create credentials directory with secure permissions"""
        self.cred_dir.mkdir(mode=0o700, exist_ok=True)

    def _get_or_create_key(self):
        """Get encryption key or create new one"""
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            os.chmod(self.key_file, stat.S_IRUSR | stat.S_IWUSR)  # 600
            return key

    def store(self, credentials):
        """Store credentials encrypted"""
        key = self._get_or_create_key()
        f = Fernet(key)

        # Encrypt credentials
        data = json.dumps(credentials).encode()
        encrypted = f.encrypt(data)

        # Write encrypted data
        with open(self.cred_file, 'wb') as file:
            file.write(encrypted)
        os.chmod(self.cred_file, stat.S_IRUSR | stat.S_IWUSR)  # 600

    def retrieve(self):
        """Retrieve and decrypt credentials"""
        if not self.cred_file.exists():
            raise ValueError("No credentials stored")

        key = self._get_or_create_key()
        f = Fernet(key)

        # Read and decrypt
        with open(self.cred_file, 'rb') as file:
            encrypted = file.read()

        decrypted = f.decrypt(encrypted)
        return json.loads(decrypted.decode())

    def cleanup(self):
        """Securely delete credentials"""
        for file in [self.cred_file, self.key_file]:
            if file.exists():
                # Overwrite with random data
                file_size = file.stat().st_size
                with open(file, 'wb') as f:
                    f.write(os.urandom(file_size))
                file.unlink()

# Usage example
if __name__ == '__main__':
    creds = SecureCredentials()

    # Store credentials
    creds.store({
        'api_key': 'sk-1234567890',
        'username': 'user@example.com'
    })

    # Retrieve credentials
    retrieved = creds.retrieve()
    print(f"Retrieved credentials for: {retrieved['username']}")

    # Cleanup when done
    creds.cleanup()
```

### Example 4: Safe Output Handling

```python
#!/usr/bin/env python3
"""
Safe output handling with sanitization and size limits
"""
import re
import sys
from io import StringIO

class SafeOutput:
    """Handle output with security controls"""

    def __init__(self, max_size=1_000_000, redact=True):
        self.max_size = max_size
        self.redact = redact
        self.buffer = StringIO()
        self.size = 0

    def write(self, text):
        """Write text with size checking and sanitization"""
        # Sanitize if enabled
        if self.redact:
            text = self._redact_sensitive(text)

        # Check size limit
        text_size = len(text.encode('utf-8'))
        if self.size + text_size > self.max_size:
            raise ValueError(f"Output size limit ({self.max_size} bytes) exceeded")

        self.buffer.write(text)
        self.size += text_size

    def _redact_sensitive(self, text):
        """Redact sensitive information"""
        # Redact email addresses
        text = re.sub(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            '[EMAIL]',
            text
        )

        # Redact API keys
        text = re.sub(r'sk-[a-zA-Z0-9]{32,}', '[API_KEY]', text)
        text = re.sub(r'Bearer [a-zA-Z0-9._-]+', 'Bearer [TOKEN]', text)

        # Redact IP addresses
        text = re.sub(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '[IP]', text)

        # Redact potential passwords (password= or pwd=)
        text = re.sub(
            r'(password|pwd|pass)\s*=\s*[^\s&]+',
            r'\1=[REDACTED]',
            text,
            flags=re.IGNORECASE
        )

        return text

    def get_output(self):
        """Get the buffered output"""
        return self.buffer.getvalue()

    def flush_to_file(self, filepath):
        """Write output to file with secure permissions"""
        import os

        with open(filepath, 'w') as f:
            f.write(self.get_output())

        # Set secure permissions
        os.chmod(filepath, 0o600)

# Usage example
if __name__ == '__main__':
    output = SafeOutput(max_size=10_000, redact=True)

    try:
        # Write various outputs
        output.write("Processing user: user@example.com\n")
        output.write("API Key: sk-1234567890abcdef\n")
        output.write("Server IP: 192.168.1.1\n")
        output.write("Password: secret123\n")

        # Get sanitized output
        print("=== Sanitized Output ===")
        print(output.get_output())

    except ValueError as e:
        print(f"Output error: {e}", file=sys.stderr)
```

### Example 5: Encrypted Storage

```python
#!/usr/bin/env python3
"""
Encrypted storage for temporary data
"""
import os
import json
import tempfile
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
import getpass

class EncryptedStorage:
    """Encrypted file storage with password"""

    def __init__(self, storage_dir=None):
        if storage_dir is None:
            storage_dir = tempfile.mkdtemp(prefix='secure_')

        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(mode=0o700, exist_ok=True)
        self._password = None
        self._fernet = None

    def _derive_key(self, password, salt):
        """Derive encryption key from password"""
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        return kdf.derive(password.encode())

    def _get_fernet(self):
        """Get Fernet instance with derived key"""
        if self._fernet is None:
            if self._password is None:
                self._password = getpass.getpass("Enter encryption password: ")

            # Generate or load salt
            salt_file = self.storage_dir / '.salt'
            if salt_file.exists():
                with open(salt_file, 'rb') as f:
                    salt = f.read()
            else:
                salt = os.urandom(16)
                with open(salt_file, 'wb') as f:
                    f.write(salt)
                os.chmod(salt_file, 0o600)

            # Derive key
            key = self._derive_key(self._password, salt)
            self._fernet = Fernet(key)

        return self._fernet

    def store(self, name, data):
        """Store data encrypted"""
        f = self._get_fernet()

        # Convert data to JSON
        json_data = json.dumps(data).encode()

        # Encrypt
        encrypted = f.encrypt(json_data)

        # Write to file
        file_path = self.storage_dir / f"{name}.enc"
        with open(file_path, 'wb') as file:
            file.write(encrypted)

        # Set secure permissions
        os.chmod(file_path, 0o600)

    def retrieve(self, name):
        """Retrieve and decrypt data"""
        f = self._get_fernet()

        file_path = self.storage_dir / f"{name}.enc"
        if not file_path.exists():
            raise ValueError(f"No data stored with name: {name}")

        # Read encrypted data
        with open(file_path, 'rb') as file:
            encrypted = file.read()

        # Decrypt
        try:
            decrypted = f.decrypt(encrypted)
            return json.loads(decrypted.decode())
        except Exception as e:
            raise ValueError(f"Decryption failed. Wrong password? {e}")

    def list_items(self):
        """List stored items"""
        return [f.stem for f in self.storage_dir.glob('*.enc')]

    def delete(self, name):
        """Securely delete stored item"""
        file_path = self.storage_dir / f"{name}.enc"
        if file_path.exists():
            # Overwrite with random data
            file_size = file_path.stat().st_size
            with open(file_path, 'wb') as f:
                f.write(os.urandom(file_size))
            file_path.unlink()

    def cleanup(self):
        """Securely cleanup all stored data"""
        for item in self.list_items():
            self.delete(item)

        # Delete salt file
        salt_file = self.storage_dir / '.salt'
        if salt_file.exists():
            with open(salt_file, 'wb') as f:
                f.write(os.urandom(16))
            salt_file.unlink()

        # Remove directory
        self.storage_dir.rmdir()

# Usage example
if __name__ == '__main__':
    storage = EncryptedStorage()

    try:
        # Store sensitive data
        storage.store('api_config', {
            'api_key': 'sk-1234567890',
            'endpoint': 'https://api.example.com',
            'timeout': 30
        })

        storage.store('user_data', {
            'username': 'john.doe',
            'email': 'john@example.com'
        })

        # List items
        print(f"Stored items: {storage.list_items()}")

        # Retrieve data
        config = storage.retrieve('api_config')
        print(f"Retrieved config: {config['endpoint']}")

        # Cleanup when done
        storage.cleanup()
        print("All data securely deleted")

    except Exception as e:
        print(f"Error: {e}")
        storage.cleanup()
```

## Conclusion

Security for temporary scripts requires the same diligence as production code. Key takeaways:

1. **Never trust user input** - Always validate and sanitize
2. **Protect credentials** - Use keyring, environment variables, or encryption
3. **Limit privileges** - Run with minimum necessary permissions
4. **Set resource limits** - Prevent resource exhaustion attacks
5. **Use HTTPS** - Always verify certificates
6. **Cleanup thoroughly** - Securely delete sensitive data
7. **Monitor execution** - Watch for suspicious behavior
8. **Use sandboxing** - Isolate untrusted code

Remember: The temporary nature of scripts doesn't reduce their security requirements. A compromised temporary script can do just as much damage as a compromised production system.
