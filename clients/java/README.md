# IRL Java SDK

A thin, native Java wrapper for the Integration Resilience Layer (IRL).

## Installation

Add `IrlClient.java` to your project's source tree. Requires Java 11+.

## Quick Start

### Authentication

The IRL Sidecar requires an `X-IRL-API-KEY`. This key is used to identify your tenant and enforce scope-based access controls.

```java
import clients.java.IrlClient;

public class Main {
    public static void main(String[] args) {
        String sidecarUrl = "http://localhost:3000";
        String apiKey = "tenant_a_key"; // Ensure this key has 'write' scope
        String integration = "finance_service";
        String payload = "{\"total\": 100.0, \"currency\": \"USD\"}";

        try {
            boolean isValid = IrlClient.verify(payload, integration, sidecarUrl, apiKey);
            if (isValid) {
                System.out.println("✅ Verification passed!");
            }
        } catch (RuntimeException e) {
            System.err.println("❌ Verification failed: " + e.getMessage());
        }
    }
}
```

## Migration Guide

If you are upgrading from a pre-authenticated version of IRL:
1. Update your `IrlClient.verify()` calls to include the `apiKey` as the fourth argument.
2. The client now automatically appends `/verify/{integrationName}` to your `sidecarUrl` if it's not already present.
