package io.github.nil_malh.cucumber.reportr;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Core Integration Tests")
class CoreIntegrationTest {

    @TempDir
    Path tempDir;

    private File outputDir;
    private File jsonFile;

    @BeforeEach
    void setUp() throws IOException {
        outputDir = tempDir.resolve("integration-output").toFile();
        jsonFile = tempDir.resolve("integration-cucumber.json").toFile();
    }

    @Test
    @DisplayName("Should handle real cucumber JSON report structure")
    void shouldHandleRealCucumberJsonReportStructure() throws IOException {
        // Given - Real cucumber JSON structure from actual cucumber run
        String realCucumberJson = """
            [
              {
                "line": 1,
                "elements": [
                  {
                    "line": 3,
                    "name": "User login with valid credentials",
                    "description": "",
                    "id": "user-authentication;user-login-with-valid-credentials",
                    "type": "scenario",
                    "keyword": "Scenario",
                    "steps": [
                      {
                        "result": {
                          "duration": 1256789012,
                          "status": "passed"
                        },
                        "line": 4,
                        "name": "I am on the login page",
                        "match": {
                          "location": "LoginSteps.java:15"
                        },
                        "keyword": "Given "
                      },
                      {
                        "result": {
                          "duration": 2456789012,
                          "status": "passed"
                        },
                        "line": 5,
                        "name": "I enter valid username and password",
                        "match": {
                          "location": "LoginSteps.java:20"
                        },
                        "keyword": "When "
                      },
                      {
                        "result": {
                          "duration": 856789012,
                          "status": "passed"
                        },
                        "line": 6,
                        "name": "I should be redirected to dashboard",
                        "match": {
                          "location": "LoginSteps.java:25"
                        },
                        "keyword": "Then "
                      }
                    ],
                    "tags": [
                      {
                        "line": 2,
                        "name": "@smoke"
                      },
                      {
                        "line": 2,
                        "name": "@login"
                      }
                    ]
                  },
                  {
                    "line": 8,
                    "name": "User login with invalid credentials",
                    "description": "",
                    "id": "user-authentication;user-login-with-invalid-credentials",
                    "type": "scenario",
                    "keyword": "Scenario",
                    "steps": [
                      {
                        "result": {
                          "duration": 756789012,
                          "status": "passed"
                        },
                        "line": 9,
                        "name": "I am on the login page",
                        "match": {
                          "location": "LoginSteps.java:15"
                        },
                        "keyword": "Given "
                      },
                      {
                        "result": {
                          "duration": 1356789012,
                          "status": "passed"
                        },
                        "line": 10,
                        "name": "I enter invalid username and password",
                        "match": {
                          "location": "LoginSteps.java:30"
                        },
                        "keyword": "When "
                      },
                      {
                        "result": {
                          "duration": 456789012,
                          "status": "failed",
                          "error_message": "Expected error message 'Invalid credentials' but was 'Login failed'\\n\\tat org.junit.Assert.fail(Assert.java:88)\\n\\tat LoginSteps.verifyErrorMessage(LoginSteps.java:35)"
                        },
                        "line": 11,
                        "name": "I should see an error message",
                        "match": {
                          "location": "LoginSteps.java:35"
                        },
                        "keyword": "Then "
                      }
                    ]
                  }
                ],
                "name": "User Authentication",
                "description": "As a user\\nI want to authenticate with the system\\nSo that I can access my account",
                "id": "user-authentication",
                "keyword": "Feature",
                "uri": "features/authentication.feature",
                "tags": [
                  {
                    "line": 0,
                    "name": "@authentication"
                  }
                ]
              }
            ]
            """;

        Files.writeString(jsonFile.toPath(), realCucumberJson, StandardCharsets.UTF_8);

        // When
        Core.generatePrettyReport(jsonFile, outputDir);

        // Then
        assertThat(outputDir).exists();
        File reportFile = new File(outputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }

    @Test
    @DisplayName("Should handle multiple features in JSON report")
    void shouldHandleMultipleFeaturesInJsonReport() throws IOException {
        // Given
        String multiFeatureJson = """
            [
              {
                "uri": "features/feature1.feature",
                "id": "feature1",
                "keyword": "Feature",
                "name": "Feature 1",
                "line": 1,
                "elements": [
                  {
                    "id": "feature1;scenario1",
                    "keyword": "Scenario",
                    "name": "Scenario 1",
                    "line": 3,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "Given ",
                        "name": "step 1",
                        "line": 4,
                        "result": {"status": "passed", "duration": 1000000}
                      }
                    ]
                  }
                ]
              },
              {
                "uri": "features/feature2.feature",
                "id": "feature2",
                "keyword": "Feature",
                "name": "Feature 2",
                "line": 1,
                "elements": [
                  {
                    "id": "feature2;scenario1",
                    "keyword": "Scenario",
                    "name": "Scenario 1",
                    "line": 3,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "When ",
                        "name": "step 2",
                        "line": 4,
                        "result": {"status": "skipped"}
                      }
                    ]
                  }
                ]
              }
            ]
            """;

        Files.writeString(jsonFile.toPath(), multiFeatureJson, StandardCharsets.UTF_8);

        // When & Then - Should not throw exception
        Core.generatePrettyReport(jsonFile, outputDir);

        assertThat(outputDir).exists();
        File reportFile = new File(outputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }

    @Test
    @DisplayName("Should handle scenarios with background steps")
    void shouldHandleScenariosWithBackgroundSteps() throws IOException {
        // Given
        String jsonWithBackground = """
            [
              {
                "uri": "features/background.feature",
                "id": "background-feature",
                "keyword": "Feature",
                "name": "Feature with Background",
                "line": 1,
                "elements": [
                  {
                    "keyword": "Background",
                    "name": "Common setup",
                    "line": 3,
                    "type": "background",
                    "steps": [
                      {
                        "keyword": "Given ",
                        "name": "I have common setup",
                        "line": 4,
                        "result": {"status": "passed", "duration": 500000}
                      }
                    ]
                  },
                  {
                    "id": "background-feature;test-scenario",
                    "keyword": "Scenario",
                    "name": "Test Scenario",
                    "line": 6,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "When ",
                        "name": "I perform an action",
                        "line": 7,
                        "result": {"status": "passed", "duration": 1000000}
                      }
                    ]
                  }
                ]
              }
            ]
            """;

        Files.writeString(jsonFile.toPath(), jsonWithBackground, StandardCharsets.UTF_8);

        // When & Then - Should not throw exception
        Core.generatePrettyReport(jsonFile, outputDir);

        assertThat(outputDir).exists();
        File reportFile = new File(outputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }

    @Test
    @DisplayName("Should handle scenario outlines with examples")
    void shouldHandleScenarioOutlinesWithExamples() throws IOException {
        // Given
        String jsonWithOutlines = """
            [
              {
                "uri": "features/outline.feature",
                "id": "outline-feature",
                "keyword": "Feature",
                "name": "Feature with Scenario Outline",
                "line": 1,
                "elements": [
                  {
                    "id": "outline-feature;test-outline;;2",
                    "keyword": "Scenario",
                    "name": "Test Outline",
                    "line": 7,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "Given ",
                        "name": "I have value1",
                        "line": 4,
                        "result": {"status": "passed", "duration": 1000000}
                      },
                      {
                        "keyword": "When ",
                        "name": "I use value2",
                        "line": 5,
                        "result": {"status": "passed", "duration": 1500000}
                      }
                    ]
                  },
                  {
                    "id": "outline-feature;test-outline;;3",
                    "keyword": "Scenario",
                    "name": "Test Outline",
                    "line": 8,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "Given ",
                        "name": "I have value3",
                        "line": 4,
                        "result": {"status": "failed", "duration": 800000, "error_message": "Value not found"}
                      }
                    ]
                  }
                ]
              }
            ]
            """;

        Files.writeString(jsonFile.toPath(), jsonWithOutlines, StandardCharsets.UTF_8);

        // When & Then - Should not throw exception
        Core.generatePrettyReport(jsonFile, outputDir);

        assertThat(outputDir).exists();
        File reportFile = new File(outputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }

    @Test
    @DisplayName("Should handle JSON with attachments and embeddings")
    void shouldHandleJsonWithAttachmentsAndEmbeddings() throws IOException {
        // Given
        String jsonWithAttachments = """
            [
              {
                "uri": "features/attachments.feature",
                "id": "attachments-feature",
                "keyword": "Feature",
                "name": "Feature with Attachments",
                "line": 1,
                "elements": [
                  {
                    "id": "attachments-feature;scenario-with-attachments",
                    "keyword": "Scenario",
                    "name": "Scenario with Attachments",
                    "line": 3,
                    "type": "scenario",
                    "steps": [
                      {
                        "keyword": "Given ",
                        "name": "I take a screenshot",
                        "line": 4,
                        "result": {"status": "passed", "duration": 2000000},
                        "embeddings": [
                          {
                            "mime_type": "image/png",
                            "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                          }
                        ]
                      },
                      {
                        "keyword": "When ",
                        "name": "I attach a file",
                        "line": 5,
                        "result": {"status": "passed", "duration": 1000000},
                        "embeddings": [
                          {
                            "mime_type": "text/plain",
                            "data": "VGhpcyBpcyBhIHRlc3QgZmlsZQ=="
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
            """;

        Files.writeString(jsonFile.toPath(), jsonWithAttachments, StandardCharsets.UTF_8);

        // When & Then - Should not throw exception
        Core.generatePrettyReport(jsonFile, outputDir);

        assertThat(outputDir).exists();
        File reportFile = new File(outputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }
}
