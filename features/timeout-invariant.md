# Feature Proposal: Timeout Invariant

## Overview

This document proposes a new "timeout" invariant for IRL. This feature will allow SREs and platform engineers to enforce consistent timeout policies across a polyglot microservices architecture, directly from the IRL governance layer.

## The Problem

As described in the "Overwhelmed SRE" persona (Alex), one of the biggest challenges in a microservices architecture is configuration drift. Each service has its own timeout settings, which can lead to cascading failures and long debugging sessions.

Currently, IRL focuses on the *content* of data, but not the *timing* of requests. This proposal extends IRL's governance capabilities to include network resilience patterns.

## The Solution: The `timeout` Invariant

I propose adding a new `timeout` invariant to the `invariants.json` file. This invariant will allow users to specify a timeout in milliseconds for requests to a specific integration.

### `invariants.json` Example

Here's how the `timeout` invariant would look in the `invariants.json` file:

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

In this example, all requests to this integration will have a timeout of 5000 milliseconds (5 seconds).

### Implementation Details

To implement this feature, the following changes would need to be made to `irl/src/sidecar.js`:

1.  **Load the `timeout` invariant:** The `sidecar.js` would need to be modified to load the `timeout` invariant from the `invariants.json` file.

2.  **Apply the timeout to the request:** When proxying a request, the `sidecar.js` would need to apply the specified timeout to the `http.request` object.

3.  **Handle timeout errors:** If a request times out, the `sidecar.js` should return a `504 Gateway Timeout` error to the client.

Here's a snippet of how the `sidecar.js` could be modified:

```javascript
// ... inside the http.createServer callback in irl/src/sidecar.js

const invariants = await loadInvariants(integration);
const timeoutInvariant = invariants.find(i => i.path === 'request.timeout' && i.rule === 'timeout');

const forwardOptions = {
    ...options,
    headers: forwardHeaders,
    timeout: timeoutInvariant ? timeoutInvariant.value : undefined // Apply the timeout here
};

const proxyReq = http.request(forwardOptions, proxyRes => {
    // ...
});

proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.writeHead(504, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'TIMEOUT',
        message: 'The upstream service did not respond in time.'
    }));
});

// ...
```

## Benefits

*   **Centralized Governance:** Enforce consistent timeout policies across all services from a single place.
*   **Increased Resilience:** Prevent cascading failures caused by misconfigured timeouts.
*   **Improved Debugging:** Quickly identify services that are not meeting their SLAs.

## Next Steps

This feature proposal provides a blueprint for implementing the `timeout` invariant. The next step would be to create a new branch, implement the changes to `sidecar.js`, and add a new set of tests to verify the functionality.
