import json
import urllib.request
import urllib.error
from typing import Dict, Any, Union

class InvariantViolationError(Exception):
    """Raised when the IRL Sidecar detects a semantic invariant violation."""
    def __init__(self, message: str, violations: list):
        super().__init__(message)
        self.violations = violations

class IRLConnectionError(Exception):
    """Raised when communication with the Sidecar fails."""
    pass

class Firewall:
    def __init__(self, sidecar_url: str = "http://localhost:3000", api_key: str = None):
        self.sidecar_url = sidecar_url
        self.api_key = api_key

    def verify(self, payload: Dict[str, Any], integration_name: str) -> bool:
        """
        Sends the payload to the IRL Sidecar for verification.
        
        Args:
            payload: The data dictionary to verify.
            integration_name: The registry name for this integration (e.g., 'python_qa').
            
        Returns:
            True if the payload is valid and forwarded.
            
        Raises:
            InvariantViolationError: If the payload is blocked due to invariant rules.
            IRLConnectionError: If the Sidecar is unreachable or returns an unexpected error.
        """
        # Append /verify path if needed
        endpoint = self.sidecar_url
        if not endpoint.endswith('/verify'):
            endpoint = f"{endpoint.rstrip('/')}/verify/{integration_name}"

        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(endpoint, data=data, method="POST")
        req.add_header('Content-Type', 'application/json')
        req.add_header('x-irl-integration', integration_name)
        if self.api_key:
            req.add_header('x-irl-api-key', self.api_key)

        try:
            with urllib.request.urlopen(req) as response:
                # 200 OK
                return True
        except urllib.error.HTTPError as e:
            if e.code == 422:
                # Read the error body
                body = e.read().decode('utf-8')
                try:
                    resp_json = json.loads(body)
                    if resp_json.get('status') == 'INVARIANT_VIOLATION':
                        raise InvariantViolationError(
                            resp_json.get('message', 'Invariant Violation'),
                            resp_json.get('violations', [])
                        )
                except json.JSONDecodeError:
                    pass # Fall through to generic error
                
                # If it wasn't a clean 422 invariant violation json
                raise IRLConnectionError(f"Request rejected: {e.code} - {e.reason}")
            elif e.code == 502:
                 raise IRLConnectionError("Sidecar Proxy Error: Target unreachable.")
            else:
                 raise IRLConnectionError(f"HTTP Error: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            raise IRLConnectionError(f"Failed to reach Sidecar: {e.reason}")
