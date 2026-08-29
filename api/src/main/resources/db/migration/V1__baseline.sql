-- =====================================================================
-- Interatlética — Baseline do schema
-- =====================================================================
-- Convenções adotadas em todo o projeto:
--
--   1. Chaves primárias são UUID v4 geradas pelo banco (gen_random_uuid).
--      Evita enumeração de recursos em URLs públicas de evento.
--   2. Toda coluna de data/hora é TIMESTAMPTZ. A aplicação trabalha em
--      America/Sao_Paulo, mas o banco armazena em UTC.
--   3. Enumerações são VARCHAR + CHECK, nunca tipos ENUM do Postgres.
--      Alterar um CHECK é uma migration trivial; alterar um ENUM não é.
--   4. Toda tabela multi-tenant carrega atletica_id NOT NULL. Não existe
--      exceção. O isolamento depende disso.
--   5. Nomes em snake_case e em português, iguais aos do domínio falado
--      pela diretoria. O código lê como a conversa.
-- =====================================================================

-- Nenhuma extensão é exigida: gen_random_uuid() é função nativa do
-- PostgreSQL desde a versão 13. O projeto exige Postgres >= 13.

-- ---------------------------------------------------------------------
-- Gatilho genérico de atualização de timestamp
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
-- IDENTIDADE
-- =====================================================================

-- Conta única e global. Um usuário existe uma vez na plataforma inteira
-- e pode ser membro de várias atléticas. Papel e cargo NÃO moram aqui —
-- moram em `membro`, porque são relativos a cada atlética.
CREATE TABLE usuario (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(180) NOT NULL,
    provedor_sub    VARCHAR(180),
    avatar_url      TEXT,
    telefone        VARCHAR(20),
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acesso_em TIMESTAMPTZ,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uk_usuario_email        UNIQUE (email),
    CONSTRAINT uk_usuario_provedor_sub UNIQUE (provedor_sub),
    CONSTRAINT ck_usuario_email_formato CHECK (email LIKE '%_@_%._%')
);

CREATE TRIGGER trg_usuario_atualizado
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

COMMENT ON COLUMN usuario.provedor_sub IS
    'Identificador estável do provedor OAuth (claim "sub" do Google). O e-mail pode mudar; o sub não.';


-- =====================================================================
-- ATLÉTICA (tenant)
-- =====================================================================

CREATE TABLE atletica (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(60)  NOT NULL,
    nome            VARCHAR(140) NOT NULL,
    sigla           VARCHAR(20),
    instituicao     VARCHAR(160) NOT NULL,
    cidade          VARCHAR(90),
    uf              CHAR(2),
    brasao_url      TEXT,
    cor_primaria    CHAR(7),
    cor_secundaria  CHAR(7),
    instagram       VARCHAR(60),
    situacao        VARCHAR(20)  NOT NULL DEFAULT 'ATIVA',
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uk_atletica_slug     UNIQUE (slug),
    CONSTRAINT ck_atletica_slug     CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT ck_atletica_situacao CHECK (situacao IN ('ATIVA', 'SUSPENSA', 'ARQUIVADA')),
    CONSTRAINT ck_atletica_uf       CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$'),
    CONSTRAINT ck_atletica_cor_pri  CHECK (cor_primaria   IS NULL OR cor_primaria   ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT ck_atletica_cor_sec  CHECK (cor_secundaria IS NULL OR cor_secundaria ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TRIGGER trg_atletica_atualizado
    BEFORE UPDATE ON atletica
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

COMMENT ON TABLE atletica IS
    'Tenant da plataforma. Entrada é por convite: não existe autocadastro de atlética.';
COMMENT ON COLUMN atletica.slug IS
    'Identificador em URL pública: /a/{slug}/eventos. Imutável depois de publicado.';


-- Vínculo usuário × atlética. É AQUI que mora a permissão.
CREATE TABLE membro (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id     UUID         NOT NULL,
    usuario_id      UUID         NOT NULL,
    papel           VARCHAR(20)  NOT NULL DEFAULT 'MEMBRO',
    cargo           VARCHAR(80),
    situacao        VARCHAR(20)  NOT NULL DEFAULT 'ATIVO',
    entrou_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    saiu_em         TIMESTAMPTZ,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_membro_atletica  FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT fk_membro_usuario   FOREIGN KEY (usuario_id)  REFERENCES usuario  (id) ON DELETE CASCADE,
    CONSTRAINT uk_membro_vinculo   UNIQUE (atletica_id, usuario_id),
    CONSTRAINT ck_membro_papel     CHECK (papel    IN ('PRESIDENTE', 'DIRETOR', 'MEMBRO')),
    CONSTRAINT ck_membro_situacao  CHECK (situacao IN ('ATIVO', 'INATIVO', 'PENDENTE')),
    CONSTRAINT ck_membro_saida     CHECK (saiu_em IS NULL OR saiu_em >= entrou_em)
);

CREATE INDEX ix_membro_atletica ON membro (atletica_id) WHERE situacao = 'ATIVO';
CREATE INDEX ix_membro_usuario  ON membro (usuario_id);

CREATE TRIGGER trg_membro_atualizado
    BEFORE UPDATE ON membro
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

COMMENT ON COLUMN membro.papel IS
    'Nível de permissão. PRESIDENTE administra a atlética e convida; DIRETOR cria e gerencia eventos; MEMBRO participa.';
COMMENT ON COLUMN membro.cargo IS
    'Rótulo livre exibido na interface ("Diretor de Esports"). Não tem efeito sobre permissão.';


-- Convite é a única porta de entrada, tanto para atlética nova quanto
-- para membro novo. Token de uso único, com validade.
CREATE TABLE convite (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id     UUID         NOT NULL,
    email           VARCHAR(180) NOT NULL,
    papel           VARCHAR(20)  NOT NULL DEFAULT 'MEMBRO',
    token           VARCHAR(64)  NOT NULL,
    criado_por      UUID         NOT NULL,
    expira_em       TIMESTAMPTZ  NOT NULL,
    aceito_em       TIMESTAMPTZ,
    aceito_por      UUID,
    revogado_em     TIMESTAMPTZ,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_convite_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT fk_convite_criador  FOREIGN KEY (criado_por)  REFERENCES usuario  (id),
    CONSTRAINT fk_convite_aceite   FOREIGN KEY (aceito_por)  REFERENCES usuario  (id),
    CONSTRAINT uk_convite_token    UNIQUE (token),
    CONSTRAINT ck_convite_papel    CHECK (papel IN ('PRESIDENTE', 'DIRETOR', 'MEMBRO')),
    CONSTRAINT ck_convite_validade CHECK (expira_em > criado_em)
);

CREATE INDEX ix_convite_atletica ON convite (atletica_id);
CREATE INDEX ix_convite_pendente ON convite (email) WHERE aceito_em IS NULL AND revogado_em IS NULL;


-- =====================================================================
-- EVENTOS
-- =====================================================================

CREATE TABLE evento (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id         UUID         NOT NULL,
    titulo              VARCHAR(160) NOT NULL,
    slug                VARCHAR(80)  NOT NULL,
    descricao           TEXT,
    tipo                VARCHAR(20)  NOT NULL,
    modalidade          VARCHAR(60),
    status              VARCHAR(20)  NOT NULL DEFAULT 'RASCUNHO',
    visibilidade        VARCHAR(20)  NOT NULL DEFAULT 'PUBLICO',
    inicio_em           TIMESTAMPTZ  NOT NULL,
    fim_em              TIMESTAMPTZ,
    local_nome          VARCHAR(160),
    local_endereco      TEXT,
    local_mapa_url      TEXT,
    capacidade          INTEGER,
    inscricao_abre_em   TIMESTAMPTZ,
    inscricao_fecha_em  TIMESTAMPTZ,
    inscricao_por_equipe BOOLEAN     NOT NULL DEFAULT FALSE,
    capa_url            TEXT,
    -- Gancho financeiro. Nada é cobrado nesta fase; as colunas existem
    -- para que habilitar pagamento depois não vire migration destrutiva.
    valor               NUMERIC(10,2),
    criado_por          UUID         NOT NULL,
    publicado_em        TIMESTAMPTZ,
    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_evento_atletica     FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_criador      FOREIGN KEY (criado_por)  REFERENCES usuario  (id),
    CONSTRAINT uk_evento_slug         UNIQUE (atletica_id, slug),
    CONSTRAINT ck_evento_slug         CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT ck_evento_tipo         CHECK (tipo   IN ('ESPORTIVO', 'ESPORTS', 'SOCIAL', 'INTERNO')),
    CONSTRAINT ck_evento_status       CHECK (status IN ('RASCUNHO', 'PUBLICADO', 'ENCERRADO', 'CANCELADO')),
    CONSTRAINT ck_evento_visibilidade CHECK (visibilidade IN ('PUBLICO', 'REDE', 'INTERNO')),
    CONSTRAINT ck_evento_periodo      CHECK (fim_em IS NULL OR fim_em >= inicio_em),
    CONSTRAINT ck_evento_inscricao    CHECK (inscricao_fecha_em IS NULL
                                          OR inscricao_abre_em  IS NULL
                                          OR inscricao_fecha_em >= inscricao_abre_em),
    CONSTRAINT ck_evento_capacidade   CHECK (capacidade IS NULL OR capacidade > 0),
    CONSTRAINT ck_evento_valor        CHECK (valor IS NULL OR valor >= 0)
);

CREATE INDEX ix_evento_atletica  ON evento (atletica_id, inicio_em DESC);
CREATE INDEX ix_evento_agenda    ON evento (inicio_em) WHERE status = 'PUBLICADO';

CREATE TRIGGER trg_evento_atualizado
    BEFORE UPDATE ON evento
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

COMMENT ON COLUMN evento.visibilidade IS
    'PUBLICO = qualquer pessoa com o link; REDE = membros de qualquer atlética da plataforma; INTERNO = só a atlética dona.';
COMMENT ON COLUMN evento.atletica_id IS
    'Atlética anfitriã e dona do registro. Coorganizadoras ficam em evento_organizador.';


-- Evento conjunto: interatlética, copa entre faculdades, festa em parceria.
-- A anfitriã também aparece aqui, com papel ANFITRIA, para que a listagem
-- "eventos de que participo" seja uma única consulta.
CREATE TABLE evento_organizador (
    evento_id       UUID         NOT NULL,
    atletica_id     UUID         NOT NULL,
    papel           VARCHAR(20)  NOT NULL DEFAULT 'COORGANIZADORA',
    aceito_em       TIMESTAMPTZ,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_evento_organizador PRIMARY KEY (evento_id, atletica_id),
    CONSTRAINT fk_eo_evento    FOREIGN KEY (evento_id)   REFERENCES evento   (id) ON DELETE CASCADE,
    CONSTRAINT fk_eo_atletica  FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT ck_eo_papel     CHECK (papel IN ('ANFITRIA', 'COORGANIZADORA', 'CONVIDADA'))
);

CREATE INDEX ix_eo_atletica ON evento_organizador (atletica_id);


-- =====================================================================
-- EQUIPES
-- =====================================================================

-- Equipe pertence à atlética, não ao evento. O time de vôlei do Dragões
-- é o mesmo em março e em outubro; ele se INSCREVE em eventos.
CREATE TABLE equipe (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id     UUID         NOT NULL,
    nome            VARCHAR(120) NOT NULL,
    tag             VARCHAR(10),
    modalidade      VARCHAR(60)  NOT NULL,
    escudo_url      TEXT,
    ativa           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_equipe_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT uk_equipe_nome     UNIQUE (atletica_id, nome, modalidade)
);

CREATE INDEX ix_equipe_atletica ON equipe (atletica_id) WHERE ativa;

CREATE TRIGGER trg_equipe_atualizado
    BEFORE UPDATE ON equipe
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


CREATE TABLE equipe_membro (
    equipe_id       UUID         NOT NULL,
    usuario_id      UUID         NOT NULL,
    funcao          VARCHAR(20)  NOT NULL DEFAULT 'TITULAR',
    numero          SMALLINT,
    nick            VARCHAR(40),
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_equipe_membro PRIMARY KEY (equipe_id, usuario_id),
    CONSTRAINT fk_em_equipe   FOREIGN KEY (equipe_id)  REFERENCES equipe  (id) ON DELETE CASCADE,
    CONSTRAINT fk_em_usuario  FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_em_funcao   CHECK (funcao IN ('CAPITAO', 'TITULAR', 'RESERVA', 'TECNICO'))
);

CREATE INDEX ix_em_usuario ON equipe_membro (usuario_id);

COMMENT ON COLUMN equipe_membro.nick IS
    'Nickname de jogo (Riot ID, etc.). Usado nas modalidades de e-sports.';


-- =====================================================================
-- INSCRIÇÕES
-- =====================================================================

-- Uma inscrição é de uma pessoa OU de uma equipe, nunca das duas.
-- atletica_id é a atlética DE ORIGEM do inscrito — não a dona do evento.
-- É o que responde "quantos vieram de cada atlética" sem join extra.
CREATE TABLE inscricao (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id           UUID         NOT NULL,
    usuario_id          UUID,
    equipe_id           UUID,
    atletica_id         UUID,
    status              VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMADA',
    posicao_espera      INTEGER,
    observacao          TEXT,
    checkin_token       VARCHAR(32)  NOT NULL DEFAULT replace(gen_random_uuid()::TEXT, '-', ''),
    checkin_em          TIMESTAMPTZ,
    checkin_por         UUID,
    -- Ganchos financeiros, inertes nesta fase.
    valor               NUMERIC(10,2),
    status_pagamento    VARCHAR(20),
    cancelado_em        TIMESTAMPTZ,
    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_inscricao_evento   FOREIGN KEY (evento_id)   REFERENCES evento   (id) ON DELETE CASCADE,
    CONSTRAINT fk_inscricao_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario  (id) ON DELETE CASCADE,
    CONSTRAINT fk_inscricao_equipe   FOREIGN KEY (equipe_id)   REFERENCES equipe   (id) ON DELETE CASCADE,
    CONSTRAINT fk_inscricao_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id),
    CONSTRAINT fk_inscricao_checkin  FOREIGN KEY (checkin_por) REFERENCES usuario  (id),
    CONSTRAINT uk_inscricao_token    UNIQUE (checkin_token),
    CONSTRAINT ck_inscricao_sujeito  CHECK ((usuario_id IS NOT NULL) <> (equipe_id IS NOT NULL)),
    CONSTRAINT ck_inscricao_status   CHECK (status IN ('CONFIRMADA', 'LISTA_ESPERA', 'CANCELADA', 'PENDENTE')),
    CONSTRAINT ck_inscricao_pgto     CHECK (status_pagamento IS NULL
                                          OR status_pagamento IN ('ISENTO', 'PENDENTE', 'PAGO', 'ESTORNADO')),
    CONSTRAINT ck_inscricao_espera   CHECK ((status = 'LISTA_ESPERA') = (posicao_espera IS NOT NULL))
);

-- Impede inscrição duplicada sem bloquear reinscrição após cancelamento.
CREATE UNIQUE INDEX uk_inscricao_usuario ON inscricao (evento_id, usuario_id)
    WHERE usuario_id IS NOT NULL AND status <> 'CANCELADA';
CREATE UNIQUE INDEX uk_inscricao_equipe  ON inscricao (evento_id, equipe_id)
    WHERE equipe_id IS NOT NULL AND status <> 'CANCELADA';

CREATE INDEX ix_inscricao_evento   ON inscricao (evento_id, status);
CREATE INDEX ix_inscricao_usuario  ON inscricao (usuario_id);
CREATE INDEX ix_inscricao_atletica ON inscricao (atletica_id);

CREATE TRIGGER trg_inscricao_atualizado
    BEFORE UPDATE ON inscricao
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

COMMENT ON COLUMN inscricao.checkin_token IS
    'Conteúdo do QR code entregue ao inscrito. Aleatório e único; a leitura na portaria só grava checkin_em.';


-- =====================================================================
-- TORNEIOS
-- =====================================================================

CREATE TABLE torneio (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id           UUID         NOT NULL,
    atletica_id         UUID         NOT NULL,
    nome                VARCHAR(160) NOT NULL,
    modalidade          VARCHAR(60)  NOT NULL,
    formato             VARCHAR(30)  NOT NULL,
    vagas               INTEGER      NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'INSCRICOES',
    regulamento_url     TEXT,
    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_torneio_evento   FOREIGN KEY (evento_id)   REFERENCES evento   (id) ON DELETE CASCADE,
    CONSTRAINT fk_torneio_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT ck_torneio_formato  CHECK (formato IN ('ELIMINACAO_SIMPLES', 'ELIMINACAO_DUPLA',
                                                      'GRUPOS', 'PONTOS_CORRIDOS', 'SUICO')),
    CONSTRAINT ck_torneio_status   CHECK (status  IN ('INSCRICOES', 'CHAVEADO', 'EM_ANDAMENTO',
                                                      'ENCERRADO', 'CANCELADO')),
    CONSTRAINT ck_torneio_vagas    CHECK (vagas >= 2)
);

CREATE INDEX ix_torneio_evento ON torneio (evento_id);

CREATE TRIGGER trg_torneio_atualizado
    BEFORE UPDATE ON torneio
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


-- Participante do torneio. Desacoplado de inscricao de propósito: nem todo
-- inscrito compete (staff, reserva) e nem todo competidor se inscreveu pela
-- plataforma na primeira temporada de uso.
CREATE TABLE torneio_participante (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    torneio_id      UUID         NOT NULL,
    equipe_id       UUID,
    usuario_id      UUID,
    nome_exibicao   VARCHAR(120) NOT NULL,
    seed            SMALLINT,
    situacao        VARCHAR(20)  NOT NULL DEFAULT 'ATIVO',
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_tp_torneio   FOREIGN KEY (torneio_id) REFERENCES torneio (id) ON DELETE CASCADE,
    CONSTRAINT fk_tp_equipe    FOREIGN KEY (equipe_id)  REFERENCES equipe  (id) ON DELETE SET NULL,
    CONSTRAINT fk_tp_usuario   FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE SET NULL,
    CONSTRAINT ck_tp_sujeito   CHECK (NOT (equipe_id IS NOT NULL AND usuario_id IS NOT NULL)),
    CONSTRAINT ck_tp_situacao  CHECK (situacao IN ('ATIVO', 'ELIMINADO', 'DESISTENTE', 'DESCLASSIFICADO')),
    CONSTRAINT uk_tp_seed      UNIQUE (torneio_id, seed)
);

CREATE INDEX ix_tp_torneio ON torneio_participante (torneio_id);

COMMENT ON COLUMN torneio_participante.nome_exibicao IS
    'Nome congelado no momento da inscrição. A tabela do torneio de 2026 não muda se a equipe se renomear em 2027.';


-- Partida com auto-relacionamento: proxima_partida_id + slot_proximo são o
-- que transforma uma lista de partidas em chaveamento navegável. Quem vence
-- a partida X entra automaticamente no slot A ou B da partida seguinte.
CREATE TABLE partida (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    torneio_id          UUID         NOT NULL,
    rodada              SMALLINT     NOT NULL,
    ordem               SMALLINT     NOT NULL,
    rotulo              VARCHAR(40),
    chave               VARCHAR(20)  NOT NULL DEFAULT 'PRINCIPAL',
    participante_a_id   UUID,
    participante_b_id   UUID,
    placar_a            SMALLINT,
    placar_b            SMALLINT,
    vencedor_id         UUID,
    melhor_de           SMALLINT     NOT NULL DEFAULT 1,
    status              VARCHAR(20)  NOT NULL DEFAULT 'AGENDADA',
    inicio_em           TIMESTAMPTZ,
    local_nome          VARCHAR(160),
    proxima_partida_id  UUID,
    slot_proximo        CHAR(1),
    observacao          TEXT,
    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_partida_torneio  FOREIGN KEY (torneio_id)         REFERENCES torneio (id) ON DELETE CASCADE,
    CONSTRAINT fk_partida_a        FOREIGN KEY (participante_a_id)  REFERENCES torneio_participante (id) ON DELETE SET NULL,
    CONSTRAINT fk_partida_b        FOREIGN KEY (participante_b_id)  REFERENCES torneio_participante (id) ON DELETE SET NULL,
    CONSTRAINT fk_partida_vencedor FOREIGN KEY (vencedor_id)        REFERENCES torneio_participante (id) ON DELETE SET NULL,
    CONSTRAINT fk_partida_proxima  FOREIGN KEY (proxima_partida_id) REFERENCES partida (id) ON DELETE SET NULL,
    CONSTRAINT uk_partida_posicao  UNIQUE (torneio_id, chave, rodada, ordem),
    CONSTRAINT ck_partida_status   CHECK (status IN ('AGENDADA', 'EM_ANDAMENTO', 'ENCERRADA', 'WO', 'CANCELADA')),
    CONSTRAINT ck_partida_chave    CHECK (chave  IN ('PRINCIPAL', 'REPESCAGEM', 'DISPUTA_TERCEIRO')),
    CONSTRAINT ck_partida_slot     CHECK (slot_proximo IS NULL OR slot_proximo IN ('A', 'B')),
    CONSTRAINT ck_partida_melhorde CHECK (melhor_de IN (1, 3, 5, 7)),
    CONSTRAINT ck_partida_avanco   CHECK ((proxima_partida_id IS NULL) = (slot_proximo IS NULL)),
    CONSTRAINT ck_partida_distinta CHECK (participante_a_id IS NULL
                                        OR participante_b_id IS NULL
                                        OR participante_a_id <> participante_b_id),
    CONSTRAINT ck_partida_encerrada CHECK (status <> 'ENCERRADA' OR vencedor_id IS NOT NULL)
);

CREATE INDEX ix_partida_torneio ON partida (torneio_id, rodada, ordem);
CREATE INDEX ix_partida_agenda  ON partida (inicio_em) WHERE status IN ('AGENDADA', 'EM_ANDAMENTO');

CREATE TRIGGER trg_partida_atualizado
    BEFORE UPDATE ON partida
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


-- Placar por mapa/set/game. Fica separado de `partida` porque MD3 de
-- Valorant e set de vôlei têm a mesma forma: várias parciais, um vencedor.
CREATE TABLE partida_parcial (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_id          UUID         NOT NULL,
    numero              SMALLINT     NOT NULL,
    rotulo              VARCHAR(60),
    placar_a            SMALLINT     NOT NULL,
    placar_b            SMALLINT     NOT NULL,

    CONSTRAINT fk_parcial_partida FOREIGN KEY (partida_id) REFERENCES partida (id) ON DELETE CASCADE,
    CONSTRAINT uk_parcial_numero  UNIQUE (partida_id, numero),
    CONSTRAINT ck_parcial_placar  CHECK (placar_a >= 0 AND placar_b >= 0)
);

COMMENT ON COLUMN partida_parcial.rotulo IS
    'Nome da parcial: mapa no e-sports ("Ascent"), número do set no vôlei.';


-- =====================================================================
-- GESTÃO INTERNA
-- =====================================================================

CREATE TABLE tarefa (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id     UUID         NOT NULL,
    evento_id       UUID,
    titulo          VARCHAR(160) NOT NULL,
    descricao       TEXT,
    responsavel_id  UUID,
    prazo           TIMESTAMPTZ,
    prioridade      VARCHAR(10)  NOT NULL DEFAULT 'MEDIA',
    status          VARCHAR(20)  NOT NULL DEFAULT 'ABERTA',
    concluida_em    TIMESTAMPTZ,
    criado_por      UUID         NOT NULL,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_tarefa_atletica    FOREIGN KEY (atletica_id)    REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT fk_tarefa_evento      FOREIGN KEY (evento_id)      REFERENCES evento   (id) ON DELETE CASCADE,
    CONSTRAINT fk_tarefa_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuario  (id) ON DELETE SET NULL,
    CONSTRAINT fk_tarefa_criador     FOREIGN KEY (criado_por)     REFERENCES usuario  (id),
    CONSTRAINT ck_tarefa_prioridade  CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA')),
    CONSTRAINT ck_tarefa_status      CHECK (status     IN ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
    CONSTRAINT ck_tarefa_conclusao   CHECK ((status = 'CONCLUIDA') = (concluida_em IS NOT NULL))
);

CREATE INDEX ix_tarefa_atletica    ON tarefa (atletica_id, status);
CREATE INDEX ix_tarefa_evento      ON tarefa (evento_id);
CREATE INDEX ix_tarefa_responsavel ON tarefa (responsavel_id) WHERE status <> 'CONCLUIDA';

CREATE TRIGGER trg_tarefa_atualizado
    BEFORE UPDATE ON tarefa
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


CREATE TABLE aviso (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    atletica_id     UUID         NOT NULL,
    evento_id       UUID,
    titulo          VARCHAR(160) NOT NULL,
    corpo           TEXT         NOT NULL,
    publico_alvo    VARCHAR(20)  NOT NULL DEFAULT 'MEMBROS',
    fixado          BOOLEAN      NOT NULL DEFAULT FALSE,
    publicado_em    TIMESTAMPTZ,
    criado_por      UUID         NOT NULL,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_aviso_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE CASCADE,
    CONSTRAINT fk_aviso_evento   FOREIGN KEY (evento_id)   REFERENCES evento   (id) ON DELETE CASCADE,
    CONSTRAINT fk_aviso_criador  FOREIGN KEY (criado_por)  REFERENCES usuario  (id),
    CONSTRAINT ck_aviso_publico  CHECK (publico_alvo IN ('MEMBROS', 'INSCRITOS', 'DIRETORIA', 'PUBLICO'))
);

CREATE INDEX ix_aviso_atletica ON aviso (atletica_id, publicado_em DESC);

CREATE TRIGGER trg_aviso_atualizado
    BEFORE UPDATE ON aviso
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


-- =====================================================================
-- AUDITORIA
-- =====================================================================

-- Diretoria muda todo ano. Registro de quem fez o quê evita a discussão
-- de "quem cancelou a inscrição do time" três semanas depois.
CREATE TABLE registro_auditoria (
    id              BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    atletica_id     UUID,
    usuario_id      UUID,
    acao            VARCHAR(60)  NOT NULL,
    entidade        VARCHAR(60)  NOT NULL,
    entidade_id     UUID,
    detalhe         JSONB,
    ip              INET,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_auditoria_atletica FOREIGN KEY (atletica_id) REFERENCES atletica (id) ON DELETE SET NULL,
    CONSTRAINT fk_auditoria_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario  (id) ON DELETE SET NULL
);

CREATE INDEX ix_auditoria_atletica ON registro_auditoria (atletica_id, criado_em DESC);
CREATE INDEX ix_auditoria_entidade ON registro_auditoria (entidade, entidade_id);
