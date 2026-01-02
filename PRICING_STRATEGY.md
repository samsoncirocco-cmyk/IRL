## Proposed 3-Tier Pricing Strategy for IRL

This document proposes a 3-tier pricing strategy for IRL, positioned as the Universal Governance Layer, taking into account market trends in API Gateway and Cloud Security Proxy pricing models.

### Market Context Summary (2026)

Based on research into enterprise API Gateways and Cloud Security Proxies, common pricing models include:

*   **Usage-Based (Per Request/Volume):** Prevalent for cloud-native services like AWS API Gateway, where costs scale directly with API calls or data processed. This model offers flexibility but can lead to unpredictable costs at high volumes.
*   **Tiered Subscriptions:** Many providers offer distinct tiers (e.g., Developer, Standard, Premium) that bundle features, performance, and support at a fixed monthly rate. These often incorporate a "unit-based" system for capacity.
*   **Per-User/Per-Resource:** Common in security solutions, tying costs to the number of identities or protected workloads.
*   **Custom Enterprise Pricing:** Reserved for large-scale, complex deployments with specific feature or support requirements.

### IRL's Proposed Pricing Tiers

Given IRL's goal of becoming the Universal Governance Layer, the following 3-tier pricing strategy is proposed, aiming for a "Goldilocks" price point that balances accessibility with enterprise value:

---

#### **Tier 1: Seed/Hobbyist**

*   **Description:** Designed for individual developers, small projects, and those exploring IRL's capabilities. Aims to remove friction for adoption and foster a community.
*   **Pricing:** **Free forever**
*   **Inclusions:**
    *   1 Sentinel instance.
    *   Basic Invariant Check capabilities.
    *   Community support.
*   **Rationale:** Aligns with market trends of offering free developer tiers (e.g., Azure API Management Developer tier) to encourage widespread adoption and allow users to experience IRL's value proposition firsthand.

---

#### **Tier 2: Scale**

*   **Description:** Targeted at growing teams and organizations that require robust governance across multiple services and environments.
*   **Pricing:** **Based on 'Invariant Check' volume** (e.g., per million invariant checks per month).
*   **Inclusions:**
    *   Multiple Sentinel instances.
    *   Advanced Invariant Check features and policies.
    *   Standard support (e.g., email/chat).
    *   Reporting and analytics on invariant violations.
    *   Integration with CI/CD pipelines.
*   **Rationale:** This usage-based model mirrors the "per-request" pricing common in API management, directly tying cost to the value derived from active governance. It allows customers to scale their usage and costs predictably as their needs grow, without large upfront commitments. The "Invariant Check" is a core metric of value delivered by IRL.

---

#### **Tier 3: Enterprise**

*   **Description:** For large enterprises with critical, complex, and often regulated environments, demanding maximum control, customization, and dedicated support.
*   **Pricing:** **Fixed annual fee**
*   **Inclusions:**
    *   Unlimited Sentinel instances.
    *   Full suite of Invariant Check capabilities, including custom policy engines.
    *   Air-gapped / On-premise deployment options.
    *   Custom SDK support and dedicated engineering assistance.
    *   Premium 24/7 support with guaranteed SLAs.
    *   Advanced security features and compliance certifications.
    *   Single Tenancy options.
*   **Rationale:** This tier addresses the specific needs of large organizations, often with strict security and compliance requirements (e.g., air-gapped deployments). A fixed fee provides cost predictability for budget planning, while custom support and SDKs cater to deep integration needs, similar to custom enterprise pricing models seen in major API management platforms like Apigee and MuleSoft.

---