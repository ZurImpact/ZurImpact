# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Uses the full Maven + JDK image to compile and package the WAR.
FROM dhi.io/maven:3-jdk21-alpine3.22-dev AS build

WORKDIR /app

# Copy POM first so Maven dependency layer is cached across rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Lean Tomcat image — only the WAR and runtime, no build tools.
FROM dhi.io/tomcat:10-jdk21-alpine3.22

# Remove default Tomcat apps to keep the image clean
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the built WAR, renamed to ROOT.war so it serves at /
COPY --from=build /app/target/backend-*.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]
