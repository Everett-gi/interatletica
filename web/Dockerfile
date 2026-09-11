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

# "true" gera a demonstracao (dados no navegador, sem API); qualquer outro
# valor gera o app que fala com o servidor. E decidido no build porque o
# Vite troca import.meta.env por constante — nao ha como mudar depois.
ARG VITE_MODO_DEMO=false
ENV VITE_MODO_DEMO=$VITE_MODO_DEMO

# Commit que gerou a imagem. Vai para /versao.json, que e como o servidor
# e o workflow de publicacao sabem que revisao esta no ar sem abrir SSH.
ARG REVISAO=desconhecida

RUN npm run build \
 && printf '{"revisao":"%s","demonstracao":%s}\n' "$REVISAO" \
      "$([ "$VITE_MODO_DEMO" = true ] && echo true || echo false)" > dist/versao.json

# ---------------------------------------------------------------------

FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/interatletica.conf
COPY --from=build /construcao/dist /usr/share/nginx/html

EXPOSE 80
