package clients.java;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class IrlClient {

    private static final HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    /**
     * Verifies the payload against the IRL Sidecar.
     *
     * @param payload         JSON string to verify
     * @param integrationName Name of the integration (e.g., "shopify")
     * @param sidecarUrl      URL of the sidecar (e.g., "http://localhost:3000")
     * @return true if valid and forwarded
     * @throws RuntimeException if blocked or connection fails
     */
    public static boolean verify(String payload, String integrationName, String sidecarUrl, String apiKey) {
        String endpoint = sidecarUrl;
        if (!endpoint.endsWith("/verify")) {
            endpoint = endpoint.replaceAll("/$", "") + "/verify/" + integrationName;
        }

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("x-irl-integration", integrationName)
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8));

        if (apiKey != null && !apiKey.isEmpty()) {
            builder.header("x-irl-api-key", apiKey);
        }

        HttpRequest request = builder.build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return true;
            } else if (response.statusCode() == 422) {
                throw new RuntimeException("Invariant Violation: " + response.body());
            } else if (response.statusCode() == 401) {
                throw new RuntimeException("Unauthorized: Invalid API Key or Scope");
            } else {
                throw new RuntimeException("IRL Sidecar Error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect to IRL Sidecar", e);
        }
    }
    
    // Simple main for quick testing if compiled
    public static void main(String[] args) {
        String url = "http://localhost:3000";
        String integration = "python_qa"; // reusing the QA integration
        String validJson = "{\"total\": 100, \"items\": []}";
        String invalidJson = "{\"total\": -50, \"items\": []}";

        try {
            System.out.println("Testing Valid Payload...");
            verify(validJson, integration, url);
            System.out.println("✅ Valid Payload Passed");
        } catch (Exception e) {
            System.err.println("❌ Valid Payload Failed: " + e.getMessage());
        }

        try {
            System.out.println("\nTesting Invalid Payload...");
            verify(invalidJson, integration, url);
            System.err.println("❌ Invalid Payload Unexpectedly Passed");
        } catch (Exception e) {
            if (e.getMessage().contains("Invariant Violation")) {
                System.out.println("✅ Caught Expected Violation: " + e.getMessage());
            } else {
                System.err.println("❌ Caught Wrong Error: " + e.getMessage());
            }
        }
    }
}
