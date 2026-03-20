# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Uses the full Maven + JDK image to compile and package the WAR.
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy POM first so Maven dependency layer is cached across rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Lean Tomcat image — only the WAR and runtime, no build tools.
FROM tomcat:10.1-jre21-temurin-alpine

# Remove default Tomcat apps to keep the image clean
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the built WAR, renamed to ROOT.war so it serves at /
COPY --from=build /app/target/backend-*.war /usr/local/tomcat/webapps/ROOT.war

# Credentials and DB config are injected as environment variables at runtime.
# For Kubernetes: use a Secret mounted as env vars in the pod spec.
# For local dev: pass --env-file .env to docker run, or set them in docker-compose.
# Required vars: DB_URL, DB_USER, DB_PASSWORD

EXPOSE 8080

CMD ["catalina.sh", "run"]
