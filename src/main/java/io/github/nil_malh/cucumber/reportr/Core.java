package io.github.nil_malh.cucumber.reportr;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.core.plugin.JsonFormatter;
import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.EventListener;
import io.cucumber.plugin.Plugin;
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
    /** True when report generation is triggered via the stream close hook. */
    private final boolean reportTriggeredOnClose;
    /** The FilterOutputStream wrapping jsonOutputStream, exposed package-privately for testing. */
    OutputStream triggeringStream;

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
        this.reportTriggeredOnClose = true;
        LOGGER.info("Writing JSON file to {}", jsonFile.getAbsolutePath());
        this.triggeringStream = new FilterOutputStream(jsonOutputStream) {
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
    @Deprecated
    protected Core(File outputDir, File jsonFile, ConcurrentEventListener delegateJsonEventListener) {
        this.outputDir = outputDir;
        this.jsonFile = jsonFile;
        this.reportTriggeredOnClose = false;
        this.triggeringStream = null;
        this.delegateJsonEventListener = delegateJsonEventListener;
    }

    protected static ConcurrentEventListener createJsonEventListener(File jsonFile) {
        try {
            LOGGER.info("Writing JSON file to {}", jsonFile.getAbsolutePath());
            return new JsonFormatter(new FileOutputStream(jsonFile));
        } catch (FileNotFoundException e) {
            throw new UncheckedIOException(e);
        }
    }

    protected static File createTempFileDeletedOnExit() throws IOException {
        return createTempFile("cucumber", ".json");
    }

    @Override
    public void setEventPublisher(EventPublisher eventPublisher) {
        delegateJsonEventListener.setEventPublisher(eventPublisher);
        if (!reportTriggeredOnClose) {
            // Deprecated constructor: generate report on TestRunFinished
            eventPublisher.registerHandlerFor(TestRunFinished.class, unused -> generatePrettyReport(jsonFile, outputDir));
        } else {
            // Stream-based: report triggers on stream close; register no-op to satisfy event wiring contract
            eventPublisher.registerHandlerFor(TestRunFinished.class, unused -> {});
        }
    }

    public static void generatePrettyReport(File jsonFile, File outputDir) {
        try {
            if (!jsonFile.exists() || jsonFile.length() == 0) {
                LOGGER.error("JSON report file not found or is empty: {}", jsonFile.getAbsolutePath());
                return;
            }

            // 1. Read and sanitize JSON report data
            String jsonReport = Files.readString(jsonFile.toPath(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            String sanitizedJson = mapper.writeValueAsString(mapper.readValue(jsonReport, Object.class));

            // 2. Read HTML template
            InputStream templateStream = Core.class.getResourceAsStream("/index.html");
            if (templateStream == null) {
                LOGGER.error("Could not find report template in resources: /index.html.");
                return;
            }
            String htmlTemplate;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(templateStream, StandardCharsets.UTF_8))) {
                htmlTemplate = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

            // 3. Inject JSON into template
            String finalHtml = htmlTemplate.replace("/* CUCUMBER_REPORT_DATA_PLACEHOLDER */", sanitizedJson);
            if (finalHtml.equals(htmlTemplate)) {
                LOGGER.error("Placeholder '/* CUCUMBER_REPORT_DATA_PLACEHOLDER */' not found in template.");
                return;
            }

            // 4. Write report
            if (!outputDir.exists() && !outputDir.mkdirs()) {
                LOGGER.error("Could not create output directory: {}", outputDir.getAbsolutePath());
                return;
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