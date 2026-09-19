FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:25-jre-alpine

RUN addgroup -S smartdesk && adduser -S smartdesk -G smartdesk
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
USER smartdesk

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]