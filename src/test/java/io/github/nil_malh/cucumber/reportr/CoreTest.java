package io.github.nil_malh.cucumber.reportr;

import io.cucumber.plugin.EventListener;
import io.cucumber.plugin.event.EventPublisher;
import io.cucumber.plugin.event.TestRunFinished;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Core Plugin Tests")
class CoreTest {

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private EventListener mockEventListener;

    @TempDir
    Path tempDir;

    private File outputDir;
    private File jsonFile;

    @BeforeEach
    void setUp() throws IOException {
        outputDir = tempDir.resolve("output").toFile();
        jsonFile = tempDir.resolve("cucumber.json").toFile();

        // Create a valid JSON file for testing
        String validJson = """
                [
                  {
                    "uri": "features/test.feature",
                    "id": "test-feature",
                    "keyword": "Feature",
                    "name": "Test Feature",
                    "description": "A test feature",
                    "line": 1,
                    "elements": [
                      {
                        "id": "test-feature;test-scenario",
                        "keyword": "Scenario",
                        "name": "Test Scenario",
                        "line": 3,
                        "type": "scenario",
                        "steps": [
                          {
                            "keyword": "Given ",
                            "name": "I have a test",
                            "line": 4,
                            "result": {
                              "status": "passed",
                              "duration": 1000000
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
                """;
        Files.writeString(jsonFile.toPath(), validJson, StandardCharsets.UTF_8);
    }

    @Test
    @DisplayName("Should create Core with default constructor")
    void shouldCreateCoreWithDefaultConstructor() throws Exception {
        // When
        Core core = new Core();

        // Then
        assertThat(core).isNotNull();
    }

    @Test
    @DisplayName("Should create Core with output directory")
    void shouldCreateCoreWithOutputDirectory() throws Exception {
        // When
        Core core = new Core(outputDir);

        // Then
        assertThat(core).isNotNull();
    }

    @Test
    @DisplayName("Should create Core with all parameters")
    void shouldCreateCoreWithAllParameters() {
        // When
        Core core = new Core(outputDir, jsonFile, mockEventListener);

        // Then
        assertThat(core).isNotNull();
    }

    @Test
    @DisplayName("Should set event publisher and register handler")
    void shouldSetEventPublisherAndRegisterHandler() throws Exception {
        // Given
        Core core = new Core(outputDir, jsonFile, mockEventListener);
        ArgumentCaptor<Class<?>> eventTypeCaptor = ArgumentCaptor.forClass(Class.class);

        // When
        core.setEventPublisher(eventPublisher);

        // Then
        verify(mockEventListener).setEventPublisher(eventPublisher);
        verify(eventPublisher).registerHandlerFor(eventTypeCaptor.capture(), any());
        assertThat(eventTypeCaptor.getValue()).isEqualTo(TestRunFinished.class);
    }

    @Test
    @DisplayName("Should create JSON event listener successfully")
    void shouldCreateJsonEventListener() throws IOException {
        // Given
        File tempJsonFile = tempDir.resolve("test.json").toFile();

        // When
        EventListener listener = Core.createJsonEventListener(tempJsonFile);

        // Then
        assertThat(listener).isNotNull();
        assertThat(tempJsonFile).exists();
    }

    @Test
    @DisplayName("Should create temp file that gets deleted on exit")
    void shouldCreateTempFileDeletedOnExit() throws IOException {
        // When
        File tempFile = Core.createTempFileDeletedOnExit();

        // Then
        assertThat(tempFile).isNotNull();
        assertThat(tempFile).exists();
        assertThat(tempFile.getName()).startsWith("cucumber");
        assertThat(tempFile.getName()).endsWith(".json");
    }
}
