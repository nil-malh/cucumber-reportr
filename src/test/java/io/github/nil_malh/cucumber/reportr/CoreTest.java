package io.github.nil_malh.cucumber.reportr;
import io.cucumber.plugin.ConcurrentEventListener;
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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
@ExtendWith(MockitoExtension.class)
@DisplayName("Core Plugin Tests")
class CoreTest {
    @Mock
    private EventPublisher eventPublisher;
    @Mock
    private ConcurrentEventListener mockEventListener;
    @TempDir
    Path tempDir;
    private File outputDir;
    private File jsonFile;
    @BeforeEach
    void setUp() throws IOException {
        outputDir = tempDir.resolve("output").toFile();
        jsonFile = tempDir.resolve("cucumber.json").toFile();
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
        Core core = new Core();
        assertThat(core).isNotNull();
    }
    @Test
    @DisplayName("Should create Core with output directory")
    void shouldCreateCoreWithOutputDirectory() throws Exception {
        Core core = new Core(outputDir);
        assertThat(core).isNotNull();
    }
    @Test
    @DisplayName("Should create Core with deprecated ConcurrentEventListener constructor")
    void shouldCreateCoreWithAllParameters() {
        Core core = new Core(outputDir, jsonFile, mockEventListener);
        assertThat(core).isNotNull();
    }
    @Test
    @DisplayName("Should create Core with OutputStream constructor")
    void shouldCreateCoreWithOutputStreamConstructor() throws IOException {
        OutputStream os = new ByteArrayOutputStream();
        Core core = new Core(outputDir, jsonFile, os);
        assertThat(core).isNotNull();
    }
    @Test
    @DisplayName("Should create Core with File and File constructor")
    void shouldCreateCoreWithFileFileConstructor() throws Exception {
        Core core = new Core(outputDir, jsonFile);
        assertThat(core).isNotNull();
    }
    @Test
    @DisplayName("Should set event publisher and register handler (deprecated constructor)")
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
    @DisplayName("Should set event publisher and register no-op handler (stream-based constructor)")
    void shouldSetEventPublisherAndRegisterNoOpHandlerForStreamConstructor() throws IOException {
        // Given
        OutputStream os = new ByteArrayOutputStream();
        Core core = new Core(outputDir, jsonFile, os);
        ArgumentCaptor<Class<?>> eventTypeCaptor = ArgumentCaptor.forClass(Class.class);
        // When
        core.setEventPublisher(eventPublisher);
        // Then
        verify(eventPublisher, atLeastOnce()).registerHandlerFor(eventTypeCaptor.capture(), any());
        assertThat(eventTypeCaptor.getAllValues()).contains(TestRunFinished.class);
    }
    @Test
    @DisplayName("Should trigger report generation when OutputStream is closed (stream-based constructor)")
    void shouldTriggerReportGenerationOnStreamClose() throws IOException {
        // Given
        File testOutputDir = tempDir.resolve("stream-close-output").toFile();
        // Use a separate sink file for the stream; jsonFile already has valid JSON content
        File streamSink = tempDir.resolve("stream-sink.json").toFile();
        OutputStream fos = new FileOutputStream(streamSink);
        Core core = new Core(testOutputDir, jsonFile, fos);
        // When - close the FilterOutputStream wrapper (simulates JsonFormatter finishing)
        core.triggeringStream.close();
        // Then - report should have been generated from jsonFile
        File reportFile = new File(testOutputDir, "cucumber-pretty-report.html");
        assertThat(reportFile).exists();
    }
    @Test
    @DisplayName("Should create JSON event listener successfully")
    void shouldCreateJsonEventListener() throws IOException {
        File tempJsonFile = tempDir.resolve("test.json").toFile();
        ConcurrentEventListener listener = Core.createJsonEventListener(tempJsonFile);
        assertThat(listener).isNotNull();
        assertThat(tempJsonFile).exists();
    }
    @Test
    @DisplayName("Should create temp file that gets deleted on exit")
    void shouldCreateTempFileDeletedOnExit() throws IOException {
        File tempFile = Core.createTempFileDeletedOnExit();
        assertThat(tempFile).isNotNull();
        assertThat(tempFile).exists();
        assertThat(tempFile.getName()).startsWith("cucumber");
        assertThat(tempFile.getName()).endsWith(".json");
    }
}
