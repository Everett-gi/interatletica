# =====================================================================
# Build em duas etapas: a imagem final serve arquivos estaticos e nao
# carrega Node nem as dependencias de build.
# =====================================================================

FROM node:22-alpine AS build
WORKDIR /construcao

# Camada de dependencias separada: mudar codigo nao rebaixa o cache do npm.
COPY package.json package-lock.json* ./

# npm ci exige lockfile e falha sem ele — o que aconteceria no primeiro
# build, antes de alguem rodar npm install e commitar o package-lock.json.
# Com lockfile presente, ci e o caminho certo: instalacao exata e
# reproduzivel. Sem ele, install resolve e o build segue.
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

COPY . .

# Injetado pelo docker-compose. Em producao e "/api", porque a PWA e a API
# moram no mesmo dominio atras do Caddy.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------------------------------------------------------------------

FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/interatletica.conf
COPY --from=build /construcao/dist /usr/share/nginx/html

EXPOSE 80
