/**
 * Base de conhecimento da rede: guias, modelos e experiências.
 *
 * <p>É a parte do produto que justifica a rede existir. Cada item aqui foi
 * escrito como se uma atlética real tivesse passado pelo problema — com
 * número, custo e o que deu errado. Um guia genérico ("planeje bem seu
 * evento") não ajuda ninguém; o que ajuda é "contrate a arbitragem com 90
 * dias, porque com 45 sobra só um fornecedor e ele sabe disso".</p>
 */

import type {
  Experiencia,
  Guia,
  Modelo,
} from '../api/tipos-conhecimento'
import { ATLETICAS, dias } from './dados'

export const GUIAS: Guia[] = [
  {
    id: 'gu-01',
    titulo: 'Como organizar um campeonato interatlético',
    resumo:
      'O roteiro completo, das modalidades ao relatório final — incluindo as '
      + 'cinco etapas que quase toda atlética descobre tarde demais.',
    area: 'EVENTOS',
    minutosDeLeitura: 12,
    atualizadoEm: dias(-25),
    autorAtletica: ATLETICAS[0],
    autorNome: 'Marina Alencar',
    salvamentos: 184,
    util: 156,
    secoes: [
      {
        titulo: 'Comece pelo calendário, não pelas modalidades',
        corpo:
          'A data manda em tudo. Ginásio, arbitragem e transporte têm '
          + 'disponibilidade limitada, e a semana de provas de cada instituição '
          + 'é diferente. Feche a data com as atléticas convidadas antes de '
          + 'decidir quais esportes entram — mudar modalidade é fácil, mudar '
          + 'data com seis atléticas já confirmadas não é.',
      },
      {
        titulo: 'Arbitragem: 90 dias, não 45',
        corpo:
          'Com 45 dias sobra um fornecedor disponível, e ele sabe disso. O '
          + 'preço da arbitragem contratada em cima da hora costuma vir 30% a '
          + '40% acima. Peça três orçamentos e feche cedo, mesmo pagando sinal.',
      },
      {
        titulo: 'A divisão de custo que evita briga',
        corpo:
          'Dividir em partes iguais parece justo e não é: a atlética que leva '
          + '12 atletas paga o mesmo que a que leva 60. Divida proporcional ao '
          + 'número de inscritos confirmados, com a conta aberta desde o começo. '
          + 'Registre isso em ata antes das inscrições abrirem.',
      },
      {
        titulo: 'Plano de chuva não é opcional',
        corpo:
          'Quadra descoberta e um sábado de chuva já cancelaram mais '
          + 'interatlética do que qualquer outro motivo. Tenha um espaço '
          + 'coberto reservado como alternativa e uma regra escrita de quando '
          + 'ela é acionada — decidir na hora, com as equipes no local, é a '
          + 'receita para reclamação.',
      },
      {
        titulo: 'Elegibilidade: confira antes, não durante',
        corpo:
          'Atleta sem matrícula ativa é o motivo número um de recurso. Peça '
          + 'comprovante na inscrição e confira antes do sorteio das chaves. '
          + 'Desclassificar equipe na semifinal destrói o evento inteiro.',
      },
      {
        titulo: 'Feche o relatório em até duas semanas',
        corpo:
          'Depois disso ninguém lembra dos números nem dos problemas. O '
          + 'relatório com custo real, presença e o que deu errado é o que a '
          + 'próxima gestão vai ler — e é o que transforma um evento em '
          + 'aprendizado da atlética, e não só da pessoa que organizou.',
      },
    ],
  },
  {
    id: 'gu-02',
    titulo: 'Prestação de contas que a assembleia entende',
    resumo:
      'Como fechar o mês em uma página, com comprovante anexado e sem '
      + 'planilha de 40 colunas.',
    area: 'FINANCEIRO',
    minutosDeLeitura: 8,
    atualizadoEm: dias(-60),
    autorAtletica: ATLETICAS[2],
    autorNome: 'Beatriz Nogueira',
    salvamentos: 142,
    util: 121,
    secoes: [
      {
        titulo: 'Uma linha por fato, não por comprovante',
        corpo:
          'Cinco notas do mesmo fornecedor no mesmo evento viram uma linha, '
          + 'com as notas anexadas. A assembleia quer saber quanto custou a '
          + 'Calourada, não quanto custou cada saco de gelo.',
      },
      {
        titulo: 'Feche todo mês, mesmo o mês vazio',
        corpo:
          'A prestação atrasada nunca é uma só: quando você percebe, são '
          + 'quatro meses e ninguém lembra do que foi cada Pix. Fechar um mês '
          + 'sem movimento leva dois minutos e mantém o hábito.',
      },
      {
        titulo: 'Publique para os membros, não só para a diretoria',
        corpo:
          'Transparência interna reduz pela metade a pergunta "para onde foi o '
          + 'dinheiro da camisa". E quando a gestão trocar, o histórico público '
          + 'é a defesa de quem saiu.',
      },
    ],
  },
  {
    id: 'gu-03',
    titulo: 'Captar o primeiro patrocínio',
    resumo:
      'O que colocar no media kit, quanto cobrar e por que contrapartida '
      + 'escrita vale mais que valor alto.',
    area: 'PATROCINIO',
    minutosDeLeitura: 10,
    atualizadoEm: dias(-90),
    autorAtletica: ATLETICAS[4],
    autorNome: 'Gustavo Peixoto',
    salvamentos: 210,
    util: 178,
    secoes: [
      {
        titulo: 'Comece pelo comércio a 500 metros do campus',
        corpo:
          'Não é a marca nacional que patrocina atlética universitária no '
          + 'primeiro ano: é a lanchonete, a ótica e a papelaria que já vivem '
          + 'do movimento dos alunos. O argumento é direto e verificável.',
      },
      {
        titulo: 'Media kit em uma página',
        corpo:
          'Quantos membros, quantos eventos por ano, quantas pessoas passam '
          + 'por eles, alcance das redes. Números reais e conferíveis. Um PDF '
          + 'de 12 páginas com foto de festa não fecha contrato.',
      },
      {
        titulo: 'Escreva a contrapartida antes do valor',
        corpo:
          'Patrocínio sem contrapartida definida vira doação, e doação não '
          + 'renova. Liste o que a empresa recebe — logo onde, post quando, '
          + 'estande em qual evento — e entregue relatório do que foi cumprido.',
      },
      {
        titulo: 'Permuta conta, e conta bastante',
        corpo:
          'A gráfica que imprime de graça vale tanto quanto quem paga o mesmo '
          + 'valor. Registre a permuta no financeiro pelo valor de mercado: '
          + 'ela precisa aparecer na prestação de contas.',
      },
    ],
  },
  {
    id: 'gu-04',
    titulo: 'Transição de gestão sem perder a memória',
    resumo:
      'O checklist do que precisa passar de uma diretoria para a outra — '
      + 'incluindo o item que quase toda atlética esquece.',
    area: 'GESTAO',
    minutosDeLeitura: 9,
    atualizadoEm: dias(-40),
    autorAtletica: ATLETICAS[1],
    autorNome: 'Rafael Bandeira',
    salvamentos: 167,
    util: 149,
    secoes: [
      {
        titulo: 'Acessos: o item esquecido',
        corpo:
          'Instagram, e-mail institucional, conta bancária, domínio, drive. '
          + 'Toda atlética que já perdeu uma conta perdeu na troca de gestão. '
          + 'Tenha dois responsáveis por acesso, sempre, e transfira antes da '
          + 'posse — não depois.',
      },
      {
        titulo: 'Passe os problemas, não só as conquistas',
        corpo:
          'Relatório que só lista vitória não serve para nada. O que a próxima '
          + 'gestão precisa saber é qual fornecedor atrasou, qual parceria '
          + 'esfriou e qual evento deu prejuízo — e por quê.',
      },
      {
        titulo: 'Faça a reunião de passagem com as duas diretorias juntas',
        corpo:
          'Documento não substitui uma hora de conversa. Marque antes da posse, '
          + 'com pauta escrita, e registre em ata o que ficou pendente.',
      },
    ],
  },
  {
    id: 'gu-05',
    titulo: 'Montar equipes e manter atleta ativo',
    resumo: 'Recrutamento, elegibilidade e o que fazer quando o time esvazia no meio da temporada.',
    area: 'ESPORTES',
    minutosDeLeitura: 7,
    atualizadoEm: dias(-120),
    autorAtletica: ATLETICAS[5],
    autorNome: 'Thiago Rezende',
    salvamentos: 98,
    util: 84,
    secoes: [
      {
        titulo: 'Treino com hora marcada e local fixo',
        corpo:
          'Time que treina "quando dá" morre em seis semanas. Reserve a quadra '
          + 'no mesmo horário toda semana, mesmo com pouca gente no começo.',
      },
      {
        titulo: 'Documentação em dia desde o primeiro treino',
        corpo:
          'Matrícula, atestado e ficha de emergência. Cobrar isso na véspera do '
          + 'campeonato é como a maioria das equipes perde atleta por WO.',
      },
      {
        titulo: 'Um responsável por modalidade, não um por tudo',
        corpo:
          'Diretor de esportes que cuida de sete modalidades sozinho não cuida '
          + 'de nenhuma. Nomeie um capitão responsável por equipe, com nome na '
          + 'lista e não só de boca.',
      },
    ],
  },
  {
    id: 'gu-06',
    titulo: 'Comunicação da atlética sem virar spam',
    resumo: 'Calendário editorial simples, público certo e a regra que evita o silenciamento.',
    area: 'MARKETING',
    minutosDeLeitura: 6,
    atualizadoEm: dias(-75),
    autorAtletica: ATLETICAS[3],
    autorNome: 'Camila Toledo',
    salvamentos: 76,
    util: 61,
    secoes: [
      {
        titulo: 'Público certo por mensagem',
        corpo:
          'Aviso de esgotamento vai para todos; pauta da reunião vai só para a '
          + 'diretoria. Mandar tudo para todos é o caminho mais curto para as '
          + 'pessoas silenciarem a notificação — e aí o aviso que importa também '
          + 'não chega.',
      },
      {
        titulo: 'Um calendário, não um impulso',
        corpo:
          'Defina no começo do mês o que será publicado e quem produz. Post '
          + 'feito na véspera é post sem foto boa e sem revisão.',
      },
    ],
  },
  {
    id: 'gu-07',
    titulo: 'Documentos que toda atlética precisa ter',
    resumo: 'Estatuto, ata, regimento e contrato: o mínimo para existir juridicamente e não travar.',
    area: 'DOCUMENTACAO',
    minutosDeLeitura: 11,
    atualizadoEm: dias(-180),
    autorAtletica: ATLETICAS[2],
    autorNome: 'Beatriz Nogueira',
    salvamentos: 133,
    util: 112,
    secoes: [
      {
        titulo: 'Estatuto registrado, não só escrito',
        corpo:
          'Sem registro em cartório a atlética não abre conta bancária, não '
          + 'assina contrato e não recebe patrocínio com nota. O custo é baixo '
          + 'e o impedimento é total.',
      },
      {
        titulo: 'Ata de toda reunião que decide algo',
        corpo:
          'Ata não é formalidade: é a prova de que a decisão foi coletiva. '
          + 'Quando alguém contestar um gasto dois anos depois, é o que existe.',
      },
      {
        titulo: 'CNPJ vale a pena?',
        corpo:
          'Vale quando há patrocínio recorrente ou conta bancária própria. '
          + 'Antes disso, o custo contábil costuma superar o benefício.',
      },
    ],
  },
  {
    id: 'gu-08',
    titulo: 'Recrutar e manter membros ativos',
    resumo: 'Como sair do ciclo de calourada cheia e assembleia vazia.',
    area: 'PESSOAS',
    minutosDeLeitura: 7,
    atualizadoEm: dias(-55),
    autorAtletica: ATLETICAS[4],
    autorNome: 'Isabela Cunha',
    salvamentos: 89,
    util: 71,
    secoes: [
      {
        titulo: 'Dê uma tarefa nominal na primeira semana',
        corpo:
          'Calouro que sai do primeiro encontro sem nada para fazer não volta. '
          + 'Uma tarefa pequena e com nome — não "ajudar no que precisar" — '
          + 'multiplica a retenção.',
      },
      {
        titulo: 'Cargo com escopo escrito',
        corpo:
          'Diretoria sem descrição de função vira presidente fazendo tudo. '
          + 'Escreva o que cada cargo responde, mesmo em uma linha.',
      },
    ],
  },
]

export const MODELOS: Modelo[] = [
  {
    id: 'md-01',
    nome: 'Estatuto de atlética universitária',
    descricao: 'Modelo base com os artigos que os cartórios costumam exigir, comentado.',
    area: 'DOCUMENTACAO',
    formato: 'DOCX',
    usos: 218,
    autorAtletica: ATLETICAS[2],
    atualizadoEm: dias(-200),
    previa: [
      'CAPÍTULO I — Da denominação, sede e finalidade',
      'CAPÍTULO II — Dos associados: admissão, direitos e deveres',
      'CAPÍTULO III — Da diretoria e do conselho fiscal',
      'CAPÍTULO IV — Do processo eleitoral',
      'CAPÍTULO V — Do patrimônio e da prestação de contas',
      'CAPÍTULO VI — Da dissolução',
    ],
  },
  {
    id: 'md-02',
    nome: 'Ata de reunião de diretoria',
    descricao: 'Estrutura mínima que dá validade à ata, com campos de deliberação e votos.',
    area: 'DOCUMENTACAO',
    formato: 'DOCX',
    usos: 341,
    autorAtletica: ATLETICAS[0],
    atualizadoEm: dias(-95),
    previa: [
      'Data, hora, local e forma de convocação',
      'Presentes e ausentes justificados',
      'Ordem do dia',
      'Deliberações, com resultado de cada votação',
      'Encaminhamentos com responsável e prazo',
      'Assinatura do presidente e do secretário',
    ],
  },
  {
    id: 'md-03',
    nome: 'Contrato de patrocínio',
    descricao: 'Contrato simples com quadro de contrapartidas e cláusula de relatório de entrega.',
    area: 'PATROCINIO',
    formato: 'DOCX',
    usos: 156,
    autorAtletica: ATLETICAS[4],
    atualizadoEm: dias(-140),
    previa: [
      'Qualificação das partes',
      'Objeto: apoio financeiro ou permuta',
      'Quadro de contrapartidas com prazo de cada uma',
      'Valor, forma e datas de repasse',
      'Uso de marca e aprovação de peças',
      'Relatório de entrega e renovação',
      'Rescisão e foro',
    ],
  },
  {
    id: 'md-04',
    nome: 'Regulamento de campeonato',
    descricao: 'Regulamento geral com pontuação, desempate, elegibilidade e recursos.',
    area: 'EVENTOS',
    formato: 'DOCX',
    usos: 189,
    autorAtletica: ATLETICAS[0],
    atualizadoEm: dias(-30),
    previa: [
      'Das inscrições e da elegibilidade dos atletas',
      'Do sistema de disputa e das chaves',
      'Da pontuação e dos critérios de desempate',
      'Da arbitragem e da mesa',
      'Das penalidades e do WO',
      'Dos recursos: prazo e instância',
      'Da premiação',
    ],
  },
  {
    id: 'md-05',
    nome: 'Planilha de prestação de contas',
    descricao: 'Uma aba por mês, categorias já preenchidas e resumo que vira PDF de uma página.',
    area: 'FINANCEIRO',
    formato: 'XLSX',
    usos: 267,
    autorAtletica: ATLETICAS[2],
    atualizadoEm: dias(-70),
    previa: [
      'Aba Resumo: receitas, despesas, saldo e gráfico',
      'Aba Lançamentos: data, descrição, categoria, valor, comprovante',
      'Aba Orçamento: previsto contra realizado',
      'Aba Eventos: custo e receita por evento',
    ],
  },
  {
    id: 'md-06',
    nome: 'Checklist de evento',
    descricao: 'As 40 verificações da véspera, separadas por área e responsável.',
    area: 'EVENTOS',
    formato: 'CHECKLIST',
    usos: 302,
    autorAtletica: ATLETICAS[1],
    atualizadoEm: dias(-45),
    previa: [
      'Estrutura: energia, som, banheiros, acessibilidade',
      'Segurança: equipe, saídas, extintores, plano de evacuação',
      'Portaria: lista, leitor de QR, pulseiras, troco',
      'Saúde: kit de primeiros socorros, contato de emergência',
      'Comunicação: cartazes, sinalização, avisos de horário',
      'Encerramento: limpeza, devolução do espaço, checagem de patrimônio',
    ],
  },
  {
    id: 'md-07',
    nome: 'Ofício para a instituição',
    descricao: 'Modelo de ofício para pedir espaço, apoio ou autorização à faculdade.',
    area: 'DOCUMENTACAO',
    formato: 'DOCX',
    usos: 124,
    autorAtletica: ATLETICAS[5],
    atualizadoEm: dias(-160),
    previa: [
      'Cabeçalho com identificação da atlética',
      'Destinatário e referência',
      'Exposição do pedido com data e justificativa',
      'Compromissos assumidos pela atlética',
      'Fecho e assinatura da presidência',
    ],
  },
  {
    id: 'md-08',
    nome: 'Plano de projeto',
    descricao: 'Uma página com objetivo, escopo, cronograma, orçamento e riscos.',
    area: 'GESTAO',
    formato: 'DOCX',
    usos: 141,
    autorAtletica: ATLETICAS[3],
    atualizadoEm: dias(-110),
    previa: [
      'Objetivo em uma frase',
      'O que está dentro e o que está fora do escopo',
      'Marcos com data',
      'Orçamento previsto por rubrica',
      'Riscos e o que fazer se acontecerem',
      'Responsável por cada frente',
    ],
  },
  {
    id: 'md-09',
    nome: 'Ficha de inscrição de atleta',
    descricao: 'Dados, documentos exigidos, contato de emergência e termo de responsabilidade.',
    area: 'ESPORTES',
    formato: 'PDF',
    usos: 198,
    autorAtletica: ATLETICAS[0],
    atualizadoEm: dias(-60),
    previa: [
      'Dados pessoais e matrícula',
      'Modalidade e categoria',
      'Contato de emergência',
      'Declaração de aptidão física',
      'Termo de uso de imagem',
    ],
  },
  {
    id: 'md-10',
    nome: 'Edital de eleição da diretoria',
    descricao: 'Edital com prazos, requisitos de chapa e regras de votação.',
    area: 'GESTAO',
    formato: 'DOCX',
    usos: 112,
    autorAtletica: ATLETICAS[2],
    atualizadoEm: dias(-88),
    previa: [
      'Cronograma eleitoral',
      'Requisitos para compor chapa',
      'Documentos de inscrição',
      'Regras de campanha',
      'Forma de votação e apuração',
      'Recursos e homologação',
    ],
  },
]

export const EXPERIENCIAS: Experiencia[] = [
  {
    id: 'ex-01',
    titulo: 'Como organizamos um evento para 500 pessoas com R$ 12 mil',
    atletica: ATLETICAS[1],
    area: 'EVENTOS',
    quando: 'Calourada de março de 2026',
    contexto:
      'Primeira calourada depois de dois anos sem festa. Sem histórico de '
      + 'custo, sem fornecedor de confiança e com prazo de cinco semanas.',
    funcionou: [
      'Fechar o espaço com o parceiro do bar dividindo o custo de locação',
      'Controle de entrada por QR: acabou a fila e a discussão de lista',
      'Segurança contratada acima do mínimo legal — quatro incidentes evitados',
      'Divulgação concentrada em três posts, não em quinze',
    ],
    naoFuncionou: [
      'Abrir 500 vagas de uma vez: esgotou em quatro horas e sobrou frustração',
      'Não avisar a vizinhança antes: rendeu duas queixas de ruído',
      'Contar copos na hora, em vez de contratar equipe de apoio',
    ],
    custo: 12000,
    publico: 500,
    fariaDiferente: [
      'Abrir as vagas em dois lotes, com uma semana de intervalo',
      'Mandar carta à vizinhança dez dias antes, com horário de término',
      'Reservar 10% do orçamento para imprevisto — gastamos 8% sem prever',
    ],
    util: 94,
    respostas: 12,
  },
  {
    id: 'ex-02',
    titulo: 'Interatlética com seis atléticas: o que a divisão de custo ensinou',
    atletica: ATLETICAS[0],
    area: 'EVENTOS',
    quando: 'Interatlética de setembro de 2025',
    contexto:
      'Segunda edição, com o dobro de atléticas da primeira. A divisão de '
      + 'custo em partes iguais quase fez duas atléticas desistirem na véspera.',
    funcionou: [
      'Passar a dividir proporcional ao número de atletas inscritos',
      'Uma atlética responsável por cada modalidade, com nome em ata',
      'Planilha de custo aberta para todas desde o primeiro dia',
    ],
    naoFuncionou: [
      'Fechar a arbitragem com 45 dias: pagamos 38% acima do orçado',
      'Deixar o regulamento de duas modalidades para a última semana',
    ],
    custo: 24000,
    publico: 372,
    fariaDiferente: [
      'Contratar arbitragem com 90 dias de antecedência',
      'Publicar todos os regulamentos antes de abrir inscrição de equipe',
      'Definir o critério de desempate por escrito antes do sorteio',
    ],
    util: 118,
    respostas: 19,
  },
  {
    id: 'ex-03',
    titulo: 'Perdemos o Instagram na troca de gestão — e como recuperamos',
    atletica: ATLETICAS[0],
    area: 'GESTAO',
    quando: 'Janeiro de 2026',
    contexto:
      'A senha estava com uma única pessoa, que se formou e trocou de número. '
      + 'A conta com 4 mil seguidores ficou inacessível por nove dias.',
    funcionou: [
      'Acionar o suporte com documento da atlética e print de posts antigos',
      'Manter os avisos importantes por outro canal enquanto a conta estava fora',
    ],
    naoFuncionou: [
      'Ter um único responsável por acesso',
      'Não ter e-mail institucional como contato de recuperação',
    ],
    custo: null,
    publico: null,
    fariaDiferente: [
      'Todo acesso com dois responsáveis e e-mail institucional na recuperação',
      'Transferir acessos antes da posse, com checklist assinado',
    ],
    util: 156,
    respostas: 23,
  },
  {
    id: 'ex-04',
    titulo: 'Nosso primeiro patrocínio: 14 nãos até o primeiro sim',
    atletica: ATLETICAS[4],
    area: 'PATROCINIO',
    quando: 'Temporada de 2025',
    contexto:
      'Atlética sem CNPJ, sem media kit e sem histórico de patrocínio. '
      + 'Começamos batendo na porta do comércio ao redor do campus.',
    funcionou: [
      'Media kit de uma página com número real de membros e alcance',
      'Oferecer permuta quando a empresa não podia pagar em dinheiro',
      'Relatório de entrega ao fim de cada trimestre: renovou no primeiro ano',
    ],
    naoFuncionou: [
      'E-mail frio sem follow-up: zero resposta em 11 tentativas',
      'Pedir valor antes de definir a contrapartida',
    ],
    custo: null,
    publico: null,
    fariaDiferente: [
      'Ir presencialmente desde o começo, e-mail só depois do primeiro contato',
      'Ter o contrato pronto antes da reunião, não depois',
    ],
    util: 132,
    respostas: 16,
  },
  {
    id: 'ex-05',
    titulo: 'Campanha do agasalho: 1.480 peças usando os jogos como coleta',
    atletica: ATLETICAS[0],
    area: 'GESTAO',
    quando: 'Maio a julho de 2026',
    contexto:
      'A campanha anterior tinha arrecadado 600 peças com ponto fixo na sala '
      + 'da atlética. Mudamos a logística, não a divulgação.',
    funcionou: [
      'Usar os jogos de vôlei como ponto de coleta: quem já ia levava junto',
      'Parceria com três instituições, com termo escrito antes de começar',
      'Divulgar o número parcial toda semana: virou disputa entre as turmas',
    ],
    naoFuncionou: [
      'Triagem deixada para o último fim de semana: cinco pessoas, doze horas',
    ],
    custo: 940,
    publico: 312,
    fariaDiferente: [
      'Triar por lote, semanalmente, em vez de tudo no fim',
      'Combinar transporte com antecedência: pagamos frete de urgência',
    ],
    util: 87,
    respostas: 9,
  },
  {
    id: 'ex-06',
    titulo: 'Circuito de e-sports: por que a primeira etapa esvaziou',
    atletica: ATLETICAS[3],
    area: 'ESPORTES',
    quando: 'Março de 2026',
    contexto:
      'Oito vagas, doze equipes interessadas e apenas quatro apareceram no dia. '
      + 'Descobrimos que o problema não era interesse.',
    funcionou: [
      'Formato MD3 com chaveamento publicado antes: ninguém reclamou de tabela',
      'Transmissão simples pelo canal da atlética, feita por dois voluntários',
    ],
    naoFuncionou: [
      'Marcar em dia de prova da metade dos cursos',
      'Não pedir confirmação 48 horas antes',
      'Laboratório com cinco máquinas para oito equipes',
    ],
    custo: 1200,
    publico: 60,
    fariaDiferente: [
      'Cruzar a data com o calendário acadêmico de todos os cursos envolvidos',
      'Exigir check-in de confirmação dois dias antes, com repescagem',
    ],
    util: 64,
    respostas: 7,
  },
]
