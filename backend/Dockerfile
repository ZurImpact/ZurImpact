# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Uses the full Maven + JDK image to compile and package the WAR.
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy POM first so Maven dependency layer is cached across rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Lean Tomcat image — only the WAR and runtime, no build tools.
FROM tomcat:10.1-jre21-temurin-jammy

# Create a non-root group and user
RUN groupadd --gid 1001 tomcat && \
    useradd --uid 1001 --gid tomcat --shell /bin/false --no-create-home tomcat

# Remove default Tomcat apps to keep the image clean
RUN rm -rf /usr/local/tomcat/webapps/*

# Tomcat needs write access to logs/, work/, temp/ /webapps at runtime
RUN chown -R 1001:1001 \
        /usr/local/tomcat/webapps \
        /usr/local/tomcat/logs \
        /usr/local/tomcat/work \
        /usr/local/tomcat/temp && \
    chmod -R 750 \
        /usr/local/tomcat/logs \
        /usr/local/tomcat/work \
        /usr/local/tomcat/temp

# Copy the built WAR, renamed to ROOT.war so it serves at /
COPY --from=build /app/target/backend-*.war /usr/local/tomcat/webapps/ROOT.war

USER 1001:1001

EXPOSE 8080

CMD ["catalina.sh", "run"]
