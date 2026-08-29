# =====================================================================
# Build em duas etapas: a imagem final nao carrega Maven nem JDK completo.
# =====================================================================

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /construcao

# Camada de dependencias separada: mudar codigo nao rebaixa o cache do Maven.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------------------------------------------------------------------

FROM eclipse-temurin:21-jre-alpine AS runtime

RUN apk add --no-cache wget tzdata \
 && addgroup -S app && adduser -S -G app app
ENV TZ=America/Sao_Paulo

WORKDIR /app
COPY --from=build --chown=app:app /construcao/target/*.jar app.jar

USER app
EXPOSE 8080

# exec form: o processo Java vira PID 1 e recebe SIGTERM direto,
# permitindo o shutdown graceful configurado no application.yml.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
