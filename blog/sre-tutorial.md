# How to Enforce Consistent Timeouts Across a Polyglot Architecture in 15 Minutes

As a Site Reliability Engineer (SRE), you're on the front lines of the battle against downtime. You know that in a complex microservices architecture, one of the most common causes of cascading failures is a simple, yet often overlooked, configuration issue: the timeout.

When one service doesn't respond in time, it can cause a chain reaction of failures that can take down your entire system. And when each service has its own timeout configuration, in its own language-specific format, just finding the source of the problem can be a nightmare.

This is where IRL comes in. IRL allows you to enforce consistent, centralized timeout policies across your entire polyglot architecture, without touching a single line of application code.

## The Problem: Configuration Drift

In a typical microservices architecture, you might have services written in Go, Python, and Java. Each of these services has its own way of configuring timeouts:

*   **Go:** `http.Client{Timeout: 5 * time.Second}`
*   **Python (requests):** `requests.get(url, timeout=5)`
*   **Java (Spring):** `restTemplate.setConnectTimeout(5000)`

This leads to configuration drift, where each service has a slightly different timeout value. And when a critical dependency is involved, this drift can be deadly.

## The Solution: Centralized Governance with IRL

IRL's "governance as infrastructure code" approach allows you to define your timeout policies in a single `invariants.json` file. The IRL sidecar then enforces these policies for all services in your architecture.

Here's how to do it in just 15 minutes:

### Step 1: Install the IRL Sidecar

If you haven't already, get the IRL sidecar up and running. The "Seed/Hobbyist" tier is free forever for 1 Sentinel.

### Step 2: Define Your Timeout Invariant

In your integration's `registry` directory, create or open the `invariants.json` file. Add the following invariant:

```json
{
  "invariants": [
    {
      "path": "request.timeout",
      "rule": "timeout",
      "value": 5000
    }
  ]
}
```

This simple configuration tells the IRL sidecar to enforce a 5-second timeout on all requests for this integration.

### Step 3: Point Your Services to the Sidecar

Update your services to point to the IRL sidecar, instead of directly to their dependencies.

For example, in your Python service, instead of calling:

```python
requests.get("https://downstream-service.com/api/data")
```

You would call:

```python
requests.get("http://localhost:3000/downstream-service/api/data", headers={"X-IRL-Integration": "my-integration"})
```

(Where `my-integration` is the name of your integration).

## The "Aha! Moment" for the SRE

This is the "Aha! Moment" for the SRE: you no longer have to worry about configuration drift. You have a single source of truth for your timeout policies, and it's enforced consistently across all of your services, regardless of what language they're written in.

This means you can:

*   **Prevent cascading failures:** Stop timeout issues before they take down your entire system.
*   **Reduce mean time to recovery (MTTR):** Quickly identify and fix services that are not meeting their SLAs.
*   **Stop chasing down development teams:** No more writing tickets to get developers to fix their timeout configurations. You can do it yourself, from a single place.

## The Future is Centralized

Consistent timeouts are just the beginning. With IRL, you can enforce a wide range of policies, from retry logic to circuit breakers, all from a single, centralized governance layer.

Ready to take control of your microservices architecture? Get started with the free tier of IRL today.
