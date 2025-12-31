from irl import Firewall, InvariantViolationError
import sys

def run_tests():
    firewall = Firewall("http://localhost:3000")
    
    print("--- Test 1: Valid Payload ---")
    valid_payload = { "total": 100, "items": [] }
    try:
        if firewall.verify(valid_payload, "python_qa"):
            print("✅ Valid payload passed.")
    except Exception as e:
        if "501" in str(e):
             print("✅ Valid payload passed firewall (Target returned 501, which is expected for python http.server).")
        else:
            print(f"❌ Valid payload failed: {e}")
            sys.exit(1)

    print("\n--- Test 2: Invariant Violation (Negative Total) ---")
    invalid_payload = { "total": -50, "items": [] }
    try:
        firewall.verify(invalid_payload, "python_qa")
        print("❌ Invalid payload was ACCEPTED (Unexpected!).")
        sys.exit(1)
    except InvariantViolationError as e:
        print(f"✅ Caught expected error: {e}")
        print(f"   Violations: {e.violations}")
    except Exception as e:
        print(f"❌ Caught wrong exception type: {type(e)} - {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
