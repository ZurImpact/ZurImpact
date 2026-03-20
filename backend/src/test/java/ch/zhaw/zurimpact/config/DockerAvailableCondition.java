package ch.zhaw.zurimpact.config;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;

/**
 * JUnit 5 condition that disables a test class when Docker is not available.
 * <p>
 * Usage: {@code @ExtendWith(DockerAvailableCondition.class)} on any test class
 * that relies on Testcontainers. When Docker Desktop is not running, the
 * test class is skipped with a clear message instead of crashing.
 */
public class DockerAvailableCondition implements ExecutionCondition {

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        try {
            org.testcontainers.DockerClientFactory.instance().client();
            return ConditionEvaluationResult.enabled("Docker is available");
        } catch (Exception e) {
            return ConditionEvaluationResult.disabled(
                    "Docker is not available — skipping integration test. " +
                    "Start Docker Desktop and re-run to execute this test.");
        }
    }
}
