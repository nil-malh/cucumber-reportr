package io.github.nil_malh.cucumber.reportr;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.core.plugin.JsonFormatter;
import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.EventListener;
import io.cucumber.plugin.Plugin;
import io.cucumber.plugin.event.EventHandler;
import io.cucumber.plugin.event.EventPublisher;
import io.cucumber.plugin.event.TestRunFinished;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.stream.Collectors;

import static java.io.File.createTempFile;

public class Core implements Plugin, ConcurrentEventListener, EventListener {
    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(Core.class);

    private final File outputDir;
    private final File jsonFile;
    private final ConcurrentEventListener delegateJsonEventListener;
    private final OutputStream jsonOutputStream;
    /** True when report generation is triggered via the stream close hook (stream-based constructors). */
    private final boolean reportTriggeredOnClose;


    public Core() throws Exception {
        this(new File("target" + File.separator + "cucumber"));
    }

    public Core(File outputDir) throws Exception {
        this(outputDir, createTempFileDeletedOnExit());
    }

    protected Core(File outputDir, final File jsonFile) throws FileNotFoundException {
        this(outputDir, jsonFile, new FileOutputStream(jsonFile));
    }

    protected Core(File outputDir, File jsonFile, OutputStream jsonOutputStream) {
        this.outputDir = outputDir;
        this.jsonFile = jsonFile;
        this.jsonOutputStream = jsonOutputStream;
        this.reportTriggeredOnClose = true;
        LOGGER.info("Writing JSON file to {}", jsonFile.getAbsolutePath());
        // Wrap the stream so that when JsonFormatter calls close(), we trigger report generation
        OutputStream triggeringStream = new FilterOutputStream(jsonOutputStream) {
            @Override
            public void close() throws IOException {
                super.close();
                LOGGER.info("JsonFormatter closed output stream, generating report...");
                generatePrettyReport(jsonFile, outputDir);
            }
        };
        this.delegateJsonEventListener = new JsonFormatter(triggeringStream);
    }

    /** @deprecated use {@link #Core(File, File, OutputStream)} */
    protected Core(File outputDir, File jsonFile, ConcurrentEventListener delegateJsonEventListener) {
        this.outputDir = outputDir;
        this.jsonFile = jsonFile;
        this.jsonOutputStream = null;
        this.reportTriggeredOnClose = false;
        this.delegateJsonEventListener = delegateJsonEventListener;
    }


    protected static ConcurrentEventListener createJsonEventListener(File jsonFile) {
        try {
            OutputStream outputStream = new FileOutputStream(jsonFile);
            LOGGER.info("Writing JSON file to {}", jsonFile.getAbsolutePath());
            return new JsonFormatter(outputStream);
        } catch (FileNotFoundException e) {
            // Should not happen, as path is created programmatically in this class
            throw new UncheckedIOException(e);
        }
    }

    protected static File createTempFileDeletedOnExit() throws IOException {
        File jsonFile = createTempFile("cucumber", ".json");
        //jsonFile.deleteOnExit();
        return jsonFile;
    }

    @Override
    public void setEventPublisher(EventPublisher eventPublisher) {
        delegateJsonEventListener.setEventPublisher(eventPublisher);
        if (!reportTriggeredOnClose) {
            // Deprecated constructor path: no stream hook, so register handler to generate report on TestRunFinished
            eventPublisher.registerHandlerFor(TestRunFinished.class, unused -> generatePrettyReport(jsonFile, outputDir));
        } else {
            // Stream-based path: report is generated when JsonFormatter closes the stream.
            // Still register a no-op handler so the event wiring contract is satisfied.
            eventPublisher.registerHandlerFor(TestRunFinished.class, unused -> {});
        }
    }

    public static void generatePrettyReport(File jsonFile, File outputDir) {
        try {
            if (!jsonFile.exists() || jsonFile.length() == 0) {
                LOGGER.error("JSON report file not found or is empty: {}", jsonFile.getAbsolutePath());
                return;
            }

            // 1. Read JSON report data and sanitize it with Jackson
            String jsonReport = Files.readString(jsonFile.toPath(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            Object jsonObject = mapper.readValue(jsonReport, Object.class);
            String sanitizedJsonReport = mapper.writeValueAsString(jsonObject);

            // 2. Read HTML template from resources
            InputStream templateStream = Core.class.getResourceAsStream("/index.html");
            if (templateStream == null) {
                LOGGER.error("Could not find report template in resources: /index.html. Make sure 'front/dist/index.html' is copied to your JAR resources.");
                return;
            }
            String htmlTemplate;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(templateStream, StandardCharsets.UTF_8))) {
                htmlTemplate = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

            // 3. Inject JSON data into the template
            String finalHtml = htmlTemplate.replace(
                "/* CUCUMBER_REPORT_DATA_PLACEHOLDER */",
                sanitizedJsonReport
            );

            // Check if replacement happened
            if (finalHtml.equals(htmlTemplate)) {
                LOGGER.error("Could not find placeholder '/* CUCUMBER_REPORT_DATA_PLACEHOLDER */' in the template. Report generation failed.");
                return;
            }

            // 4. Write the final report
            if (!outputDir.exists()) {
                if (!outputDir.mkdirs()) {
                    LOGGER.error("Could not create output directory: {}", outputDir.getAbsolutePath());
                    return;
                }
            }
            File reportFile = new File(outputDir, "cucumber-pretty-report.html");
            try (Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(reportFile), StandardCharsets.UTF_8))) {
                writer.write(finalHtml);
            }

            LOGGER.info("Cucumber pretty report generated at: {}", reportFile.getAbsolutePath());

        } catch (IOException e) {
            LOGGER.error("Failed to generate cucumber pretty report", e);
        }
    }
}