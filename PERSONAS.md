# IRL Ideal Customer Personas - 2026

This document outlines two Ideal Customer Personas (ICPs) for the Integration Resilience Layer (IRL) startup, based on research conducted in January 2026. These personas highlight the "developer friction" that IRL aims to solve.

---

### **Persona 1: The Overwhelmed SRE**

*   **Name:** Alex
*   **Role:** Site Reliability Engineer (SRE)
*   **Company:** A mid-sized tech company with a complex, polyglot microservices architecture (Go, Python, and Java).
*   **Pain Points:**
    *   **Configuration Drift:** Each service has its own retry logic, timeout settings, and circuit breaker implementation. This drift between services is a constant source of production incidents.
    *   **"Ticket-Driven Development":** Alex spends most of their time writing tickets for different development teams to fix resilience issues, rather than engineering solutions.
    *   **Inconsistent Observability:** Each service has slightly different logging and metric formats, making it difficult to get a unified view of the system's health.
    *   **Tool Sprawl:** The team uses a mix of libraries, agents, and sidecars to manage different aspects of the service mesh, leading to a high cognitive load.

#### **The "Aha! Moment" for Alex**

Alex is in a post-mortem for a critical outage. The root cause was a misconfigured timeout in a downstream Java service that caused a cascading failure in an upstream Go service. The team spent hours trying to identify the issue because the error messages were inconsistent across the services.

Frustrated, Alex starts looking for a better way to enforce consistency. They come across IRL and its concept of "governance as infrastructure code."

The "Aha! Moment" happens when Alex realizes they can define a single `invariant.json` file to enforce consistent timeouts and retry policies across *all* services, without needing to change a single line of application code.

**The 10+ Hours Saved:**

*   **No More Ticket Pushing (5 hours/week):** Alex no longer needs to chase down individual development teams to implement resilience patterns. They can enforce them centrally.
*   **Faster Incident Response (3 hours/week):** With consistent observability and error handling, Alex can identify the root cause of issues much faster.
*   **Proactive Governance (2 hours/week):** Alex can now spend time proactively improving system resilience, rather than reactively fighting fires.

---

### **Persona 2: The AI Engineer**

*   **Name:** Maya
*   **Role:** AI Engineer
*   **Company:** A startup building a customer-facing application powered by a Large Language Model (LLM).
*   **Pain Points:**
    *   **Production Anxiety:** Maya is constantly worried about "prompt injection" attacks and the model "hallucinating" and providing incorrect or offensive information to users.
    *   **"Defensive Coding" Overhead:** Maya spends a significant amount of time writing input validation and output parsing code to protect the application from the LLM's unpredictable nature.
    *   **Slow Iteration Cycles:** Every time Maya wants to try a new model or a new prompting technique, they have to rewrite a significant amount of boilerplate safety code.
    *   **Black Box Problem:** The LLM is a black box, and it's hard to know why it's generating a particular output.

#### **The "Aha! Moment" for Maya**

Maya's application has a close call. A user discovers a prompt injection vulnerability that could have been used to extract sensitive information. The vulnerability was patched, but Maya is shaken.

They start researching "LLM Firewalls" and discover IRL's "Sentinel" feature.

The "Aha! Moment" happens when Maya realizes that IRL's sidecar can act as a safety buffer between their application and the LLM. They can define invariants to validate and sanitize both the prompts sent to the model and the responses received from it, all without cluttering their application code.

**The 10+ Hours Saved:**

*   **Reduced Defensive Coding (6 hours/week):** Maya can now offload much of the input validation and output parsing logic to the IRL sidecar.
*   **Faster Experimentation (4 hours/week):** Maya can now swap out LLMs and prompting techniques much more quickly, as the core safety logic is handled by IRL.
*   **Increased Confidence (Priceless):** Maya can now sleep at night, knowing that there is a dedicated safety layer protecting their application from the unpredictable nature of LLMs.
