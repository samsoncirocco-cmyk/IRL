# Antigravity Prompt: Create the IRL Website & Blog

## 1. Project Overview

**Project:** IRL (Integration Resilience Layer)
**Description:** IRL is a language-agnostic sidecar proxy that acts as an AI Output Firewall and a centralized governance layer for microservices. It prevents "confidently wrong" AI data and API drift from corrupting systems of record by enforcing structural fingerprints and semantic invariants.

## 2. Target Audience

The website should be designed to appeal to two primary personas:

*   **Alex, the Overwhelmed SRE:** Focused on system resilience, consistency, and reducing operational overhead.
*   **Maya, the AI Engineer:** Focused on shipping AI applications with confidence, and mitigating the risks of prompt injection and model hallucinations.

## 3. Website Goals

*   Clearly communicate the value proposition of IRL.
*   Drive adoption of the "Seed/Hobbyist" free tier.
*   Build a community around the project.
*   Serve as a central hub for documentation, blog posts, and other resources.

## 4. Design & Style Guide

*   **Tone & Voice:** Professional, confident, and slightly futuristic. The tone should be authoritative but also approachable.
*   **Overall Style:** A modern, clean, and professional "tech startup" aesthetic. Use plenty of white space and high-quality graphics.
*   **Color Palette:**
    *   **Primary:** A deep blue (`#0A192F`) to evoke trust and security.
    *   **Secondary:** A vibrant green (`#64FFDA`) for calls to action and highlights.
    *   **Accent:** A light blue (`#8892B0`) for text and secondary elements.
    *   **Background:** A very light gray (`#F5F5F5`) for the main content areas.
*   **Typography:**
    *   **Headlines:** A clean, modern sans-serif font like "Inter" or "Manrope".
    *   **Body:** A highly readable sans-serif font like "Roboto" or "Open Sans".

## 5. Website Structure & Content

### **Page: Home**

*   **Hero Section:**
    *   **Headline:** "Stop chasing developers. Start enforcing resilience."
    *   **Sub-headline:** "IRL is a language-agnostic sidecar proxy that acts as an AI Output Firewall and a centralized governance layer for your microservices."
    *   **Call to Action:** A prominent button that says "Get Started for Free", linking to the "Getting Started" guide.
*   **"As Seen On" Section:** (Placeholder for future logos of companies using IRL or publications featuring IRL).
*   **Problem/Solution Section:**
    *   A side-by-side comparison of the "old way" (defensive coding, configuration drift) and the "new way" (centralized governance with IRL).
    *   Use the "Aha! Moment" marketing copy to highlight the key benefits for each persona.
*   **Features Overview Section:**
    *   A brief overview of the key features of IRL (Sentinel, Sidecar, Governance Layer), with links to the "Features" page.
*   **Testimonial Section:** (Placeholder for future testimonials from users).
*   **Final Call to Action:** Repeat the "Get Started for Free" call to action.

### **Page: Features**

*   **Structure:** A dedicated section for each key feature.
*   **Feature 1: The Sentinel (AI Output Firewall)**
    *   **Headline:** "Ship your LLM app with confidence."
    *   **Content:** Use the content from the "AI Engineer" blog post to explain how the Sentinel works and how it protects against prompt injection and hallucinations.
*   **Feature 2: The Sidecar (Universal Governance)**
    *   **Headline:** "Enforce consistency across your entire polyglot architecture."
    *   **Content:** Use the content from the "SRE" tutorial to explain how the sidecar enforces policies like timeouts and retries.
*   **Feature 3: The Governance Layer (Infrastructure as Code)**
    *   **Headline:** "Your single source of truth for system resilience."
    *   **Content:** Explain how the `invariants.json` file works and how it allows you to manage your policies as code.

### **Page: Pricing**

*   **Structure:** A clear, 3-column layout for the three pricing tiers.
*   **Content:** Use the content from the `PRICING_STRATEGY.md` file to populate the pricing table. Make the "Seed/Hobbyist" tier the most prominent.

### **Page: Blog**

*   **Structure:** A standard blog layout with a list of posts on the main page and individual pages for each post.
*   **Initial Content:** The following blog posts should be created from the existing markdown files:
    *   `blog/ai-engineer-blog-post.md`
    *   `blog/sre-tutorial.md`

### **Page: Docs**

*   **Content:** For now, this page should simply link to the "Getting Started" guide and the project's `README.md` on GitHub.

### **Page: Community**

*   **Content:**
    *   A call to action to join the community Discord or Slack channel.
    *   Information on how to contribute to the project, with a link to the `CONTRIBUTING.md` file.
    *   A section showcasing projects and use cases from the community (placeholder for now).

## 6. Execution

This prompt should be provided to a web developer or an AI agent specializing in web development. The initial version of the website can be a static site generated from markdown files (e.g., using a framework like Next.js, Hugo, or Jekyll).
