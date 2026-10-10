package io.github.nil_malh.cucumber.reportr;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.core.plugin.JsonFormatter;
import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.Plugin;
import io.cucumber.plugin.event.EventPublisher;
import io.cucumber.plugin.event.TestRunFinished;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FilterOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Instant;
import java.util.stream.Collectors;

import static java.io.File.createTempFile;

public class Core implements Plugin, ConcurrentEventListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(Core.class);

    /** Report filename written to the output directory. */
    static final String REPORT_FILENAME = "cucumber-pretty-report.html";
    /** Classpath resource for the HTML template. */
    static final String TEMPLATE_RESOURCE = "/index.html";

    private final File outputDir;
    private final File jsonFile;
    private final ConcurrentEventListener delegateJsonEventListener;
    /** The FilterOutputStream wrapping jsonOutputStream, exposed package-privately for testing. */
    OutputStream triggeringStream;

    public Core() throws Exception {
        this(new File("target" + File.separator + "cucumber"));
    }

    public Core(File outputDir) throws Exception {
        this(outputDir, createTempFileDeletedOnExit());
    }

    protected Core(File outputDir, File jsonFile) throws IOException {
        this(outputDir, jsonFile, new FileOutputStream(jsonFile));
    }

    protected Core(File outputDir, File jsonFile, OutputStream jsonOutputStream) {
        this.outputDir = outputDir;
        this.jsonFile = jsonFile;
        LOGGER.debug("Writing JSON file to {}", jsonFile.getAbsolutePath());
        this.triggeringStream = new FilterOutputStream(jsonOutputStream) {
            @Override
            public void close() throws IOException {
                super.close();
                LOGGER.debug("JsonFormatter closed output stream, generating report...");
                generatePrettyReport(jsonFile, outputDir);
            }
        };
        this.delegateJsonEventListener = new JsonFormatter(triggeringStream);
    }

    protected static File createTempFileDeletedOnExit() throws IOException {
        return createTempFile("cucumber", ".json");
    }

    @Override
    public void setEventPublisher(EventPublisher eventPublisher) {
        delegateJsonEventListener.setEventPublisher(eventPublisher);
        // Stream-based: report triggers on stream close; register no-op to satisfy event wiring
        eventPublisher.registerHandlerFor(TestRunFinished.class, unused -> {});
    }

    /**
     * Generate the pretty HTML report from a Cucumber JSON file.
     * <p>
     * Reads the JSON, sanitizes it (via Jackson to prevent injection), loads the HTML
     * template from classpath resources, injects the JSON data and a generation timestamp
     * into the template placeholders, and writes the result to the output directory.
     *
     * @param jsonFile   the Cucumber JSON report file
     * @param outputDir  the directory where the HTML report will be written
     */
    public static void generatePrettyReport(File jsonFile, File outputDir) {
        String jsonReport = readJsonReport(jsonFile);
        if (jsonReport == null) {
            return;
        }

        String sanitizedJson = sanitizeJson(jsonReport);
        if (sanitizedJson == null) {
            return;
        }

        String htmlTemplate = loadHtmlTemplate();
        if (htmlTemplate == null) {
            return;
        }

        String finalHtml = injectPlaceholders(htmlTemplate, sanitizedJson);
        if (finalHtml == null) {
            return;
        }

        writeReport(finalHtml, outputDir);
    }

    /** Read and validate the JSON report file. Returns null if the file is missing or empty. */
    private static String readJsonReport(File jsonFile) {
        if (!jsonFile.exists() || jsonFile.length() == 0) {
            LOGGER.error("JSON report file not found or is empty: {}", jsonFile.getAbsolutePath());
            return null;
        }
        try {
            return Files.readString(jsonFile.toPath(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            LOGGER.error("Failed to read JSON report file: {}", jsonFile.getAbsolutePath(), e);
            return null;
        }
    }

    /** Sanitize JSON using Jackson to prevent injection. Escapes {@code </} to {@code <\/}. */
    private static String sanitizeJson(String jsonReport) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String sanitized = mapper.writeValueAsString(mapper.readValue(jsonReport, Object.class));
            // Prevent </script> injection that could break the HTML template
            return sanitized.replace("</", "<\\/");
        } catch (IOException e) {
            LOGGER.error("Failed to parse/sanitize JSON report data", e);
            return null;
        }
    }

    /** Load the HTML template from classpath resources. Returns null if not found. */
    private static String loadHtmlTemplate() {
        InputStream templateStream = Core.class.getResourceAsStream(TEMPLATE_RESOURCE);
        if (templateStream == null) {
            LOGGER.error("Could not find report template in resources: {}.", TEMPLATE_RESOURCE);
            return null;
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(templateStream, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        } catch (IOException e) {
            LOGGER.error("Failed to read HTML template", e);
            return null;
        }
    }

    /** Inject JSON data and timestamp into the template placeholders. Returns null if the data placeholder is missing. */
    private static String injectPlaceholders(String htmlTemplate, String sanitizedJson) {
        String finalHtml = htmlTemplate.replace("/* CUCUMBER_REPORT_DATA_PLACEHOLDER */", sanitizedJson);
        if (finalHtml.equals(htmlTemplate)) {
            LOGGER.error("Placeholder '/* CUCUMBER_REPORT_DATA_PLACEHOLDER */' not found in template.");
            return null;
        }

        String generatedAt = Instant.now().toString();
        String timestampedHtml = finalHtml.replace("/* REPORT_GENERATED_AT_PLACEHOLDER */", "\"" + generatedAt + "\"");
        if (timestampedHtml.equals(finalHtml)) {
            LOGGER.warn("Placeholder '/* REPORT_GENERATED_AT_PLACEHOLDER */' not found in template; timestamp will not be displayed.");
        }
        return timestampedHtml;
    }

    /** Write the final HTML report to the output directory. */
    private static void writeReport(String html, File outputDir) {
        if (!outputDir.exists() && !outputDir.mkdirs()) {
            LOGGER.error("Could not create output directory: {}", outputDir.getAbsolutePath());
            return;
        }
        File reportFile = new File(outputDir, REPORT_FILENAME);
        try (Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(reportFile), StandardCharsets.UTF_8))) {
            writer.write(html);
        } catch (IOException e) {
            LOGGER.error("Failed to write cucumber pretty report to: {}", reportFile.getAbsolutePath(), e);
            return;
        }
        LOGGER.info("Cucumber pretty report generated at: {}", reportFile.getAbsolutePath());
    }
}