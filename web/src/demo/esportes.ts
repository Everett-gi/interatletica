/** Atletas, jogos, artilharia e viagens. */

import type { Atleta, Jogo, LinhaDeArtilharia, Viagem } from '../api/tipos-esportes'
import { dias, PESSOAS } from './dados'

interface SementeDeAtleta {
  indice: number
  curso: string
  modalidades: string[]
  equipes: string[]
  numero: number | null
  situacao: Atleta['situacao']
  jogos: number
  pontos: number
  documentacaoEmDia: boolean
}

const SEMENTES: SementeDeAtleta[] = [
  { indice: 2, curso: 'Engenharia Civil', modalidades: ['Vôlei feminino'], equipes: ['Dragões Vôlei Feminino'], numero: 7, situacao: 'ATIVO', jogos: 18, pontos: 214, documentacaoEmDia: true },
  { indice: 6, curso: 'Engenharia de Produção', modalidades: ['Vôlei feminino'], equipes: ['Dragões Vôlei Feminino'], numero: 10, situacao: 'ATIVO', jogos: 17, pontos: 186, documentacaoEmDia: true },
  { indice: 8, curso: 'Engenharia Elétrica', modalidades: ['Vôlei feminino'], equipes: ['Dragões Vôlei Feminino'], numero: 4, situacao: 'LESIONADO', jogos: 11, pontos: 92, documentacaoEmDia: true },
  { indice: 10, curso: 'Arquitetura', modalidades: ['Vôlei feminino'], equipes: ['Dragões Vôlei Feminino'], numero: 12, situacao: 'ATIVO', jogos: 9, pontos: 48, documentacaoEmDia: false },
  { indice: 1, curso: 'Engenharia Mecânica', modalidades: ['Futsal masculino'], equipes: ['Dragões Futsal'], numero: 9, situacao: 'ATIVO', jogos: 21, pontos: 34, documentacaoEmDia: true },
  { indice: 3, curso: 'Engenharia Civil', modalidades: ['Futsal masculino', 'Valorant'], equipes: ['Dragões Futsal'], numero: 3, situacao: 'ATIVO', jogos: 20, pontos: 12, documentacaoEmDia: true },
  { indice: 11, curso: 'Engenharia de Produção', modalidades: ['Futsal masculino'], equipes: ['Dragões Futsal'], numero: 1, situacao: 'ATIVO', jogos: 19, pontos: 0, documentacaoEmDia: true },
  { indice: 5, curso: 'Engenharia Química', modalidades: ['Futsal masculino'], equipes: ['Dragões Futsal'], numero: 15, situacao: 'SUSPENSO', jogos: 14, pontos: 8, documentacaoEmDia: true },
  { indice: 4, curso: 'Engenharia Ambiental', modalidades: ['Vôlei feminino'], equipes: [], numero: null, situacao: 'ATIVO', jogos: 6, pontos: 22, documentacaoEmDia: false },
  { indice: 7, curso: 'Engenharia de Computação', modalidades: ['Basquete masculino'], equipes: [], numero: 23, situacao: 'ATIVO', jogos: 12, pontos: 148, documentacaoEmDia: true },
]

export const ATLETAS: Atleta[] = SEMENTES.map((s) => {
  const pessoa = PESSOAS[s.indice]
  return {
    usuarioId: pessoa.id,
    atleticaSlug: 'dragoes',
    nome: pessoa.nome,
    avatarUrl: null,
    curso: s.curso,
    modalidades: s.modalidades,
    equipes: s.equipes,
    numero: s.numero,
    situacao: s.situacao,
    jogos: s.jogos,
    pontos: s.pontos,
    documentacaoEmDia: s.documentacaoEmDia,
    desde: dias(-200 - s.indice * 30),
  }
})

export const JOGOS: Jogo[] = [
  { id: 'jg-01', atleticaSlug: 'dragoes', modalidade: 'Vôlei feminino', equipeNome: 'Dragões Vôlei Feminino', adversario: 'Corujas Vôlei', adversarioAtleticaSlug: 'corujas', inicioEm: dias(2, 19), local: 'Quadra 2, UniVale', competicao: 'Amistoso', torneioId: null, placarNos: null, placarDeles: null, resultado: 'PENDENTE', destaques: [] },
  { id: 'jg-02', atleticaSlug: 'dragoes', modalidade: 'Futsal masculino', equipeNome: 'Dragões Futsal', adversario: 'Leões Futsal', adversarioAtleticaSlug: 'leoes', inicioEm: dias(16, 15), local: 'Ginásio da Faculdade de Direito', competicao: 'Taça Leões', torneioId: null, placarNos: null, placarDeles: null, resultado: 'PENDENTE', destaques: [] },
  { id: 'jg-03', atleticaSlug: 'dragoes', modalidade: 'Vôlei feminino', equipeNome: 'Dragões Vôlei Feminino', adversario: 'Panteras Vôlei', adversarioAtleticaSlug: 'panteras', inicioEm: dias(23, 10), local: 'Ginásio Central, UniVale', competicao: 'Interatlética 2026', torneioId: null, placarNos: null, placarDeles: null, resultado: 'PENDENTE', destaques: [] },
  { id: 'jg-04', atleticaSlug: 'dragoes', modalidade: 'Futsal masculino', equipeNome: 'Dragões Futsal', adversario: 'Javalis Futsal', adversarioAtleticaSlug: 'javalis', inicioEm: dias(-5, 19), local: 'Quadra 1, UniVale', competicao: 'Amistoso', torneioId: null, placarNos: 4, placarDeles: 2, resultado: 'VITORIA', destaques: ['Rafael Bandeira: 2 gols', 'Pedro Vilanova: defesa de pênalti'] },
  { id: 'jg-05', atleticaSlug: 'dragoes', modalidade: 'Vôlei feminino', equipeNome: 'Dragões Vôlei Feminino', adversario: 'Furacão Vôlei', adversarioAtleticaSlug: 'furacao', inicioEm: dias(-12, 20), local: 'Serra Alta', competicao: 'Amistoso', torneioId: null, placarNos: 2, placarDeles: 3, resultado: 'DERROTA', destaques: ['Camila Toledo: 21 pontos'] },
  { id: 'jg-06', atleticaSlug: 'dragoes', modalidade: 'Futsal masculino', equipeNome: 'Dragões Futsal', adversario: 'Corujas Futsal', adversarioAtleticaSlug: 'corujas', inicioEm: dias(-20, 19), local: 'Quadra 1, UniVale', competicao: 'Amistoso', torneioId: null, placarNos: 3, placarDeles: 3, resultado: 'EMPATE', destaques: [] },
  { id: 'jg-07', atleticaSlug: 'dragoes', modalidade: 'Vôlei feminino', equipeNome: 'Dragões Vôlei Feminino', adversario: 'Leões Vôlei', adversarioAtleticaSlug: 'leoes', inicioEm: dias(-28, 19), local: 'Quadra 2, UniVale', competicao: 'Amistoso', torneioId: null, placarNos: 3, placarDeles: 0, resultado: 'VITORIA', destaques: ['Larissa Prado: 18 pontos', 'Camila Toledo: 4 aces'] },
  { id: 'jg-08', atleticaSlug: 'dragoes', modalidade: 'Basquete masculino', equipeNome: 'Dragões Basquete', adversario: 'Panteras Basquete', adversarioAtleticaSlug: 'panteras', inicioEm: dias(-40, 18), local: 'Porto Aurora', competicao: 'Amistoso', torneioId: null, placarNos: 58, placarDeles: 71, resultado: 'DERROTA', destaques: ['Larissa Prado: 22 pontos'] },
]

export const ARTILHARIA: LinhaDeArtilharia[] = [
  { atletaNome: 'Camila Toledo', equipeNome: 'Dragões Vôlei Feminino', atleticaSlug: 'dragoes', total: 214, jogos: 18 },
  { atletaNome: 'Larissa Prado', equipeNome: 'Dragões Vôlei Feminino', atleticaSlug: 'dragoes', total: 186, jogos: 17 },
  { atletaNome: 'Gustavo Peixoto', equipeNome: 'Panteras Vôlei', atleticaSlug: 'panteras', total: 171, jogos: 16 },
  { atletaNome: 'Beatriz Nogueira', equipeNome: 'Furacão Vôlei', atleticaSlug: 'furacao', total: 158, jogos: 15 },
  { atletaNome: 'Helena Vasques', equipeNome: 'Dragões Vôlei Feminino', atleticaSlug: 'dragoes', total: 92, jogos: 11 },
  { atletaNome: 'Rafael Bandeira', equipeNome: 'Dragões Futsal', atleticaSlug: 'dragoes', total: 34, jogos: 21 },
  { atletaNome: 'Bruno Sarmento', equipeNome: 'Javalis Futsal', atleticaSlug: 'javalis', total: 29, jogos: 20 },
  { atletaNome: 'Diego Marinho', equipeNome: 'Dragões Futsal', atleticaSlug: 'dragoes', total: 12, jogos: 20 },
]

export const VIAGENS: Viagem[] = [
  {
    id: 'vg-01',
    atleticaSlug: 'dragoes',
    destino: 'Serra Alta, MG',
    motivo: 'Corrida da Medicina — 5 km',
    eventoId: 'e-08',
    saidaEm: dias(29, 4),
    retornoEm: dias(30, 20),
    passageiros: 34,
    vagas: 46,
    transporte: 'Ônibus fretado — Viação Caminho do Vale',
    hospedagem: 'Pousada do Mirante (quartos compartilhados)',
    custoPorPessoa: 145,
    responsavelNome: 'Camila Toledo',
    pagos: 22,
    documentosPendentes: 5,
  },
  {
    id: 'vg-02',
    atleticaSlug: 'dragoes',
    destino: 'Porto Aurora, PR',
    motivo: 'Jogos Universitários regionais',
    eventoId: null,
    saidaEm: dias(62, 5),
    retornoEm: dias(65, 22),
    passageiros: 48,
    vagas: 48,
    transporte: 'Dois micro-ônibus',
    hospedagem: 'Hotel Aurora Centro',
    custoPorPessoa: 320,
    responsavelNome: 'Rafael Bandeira',
    pagos: 12,
    documentosPendentes: 31,
  },
  {
    id: 'vg-03',
    atleticaSlug: 'dragoes',
    destino: 'Serra Alta, MG',
    motivo: 'Amistoso de vôlei contra o Furacão',
    eventoId: null,
    saidaEm: dias(-12, 14),
    retornoEm: dias(-12, 23),
    passageiros: 14,
    vagas: 16,
    transporte: 'Van',
    hospedagem: null,
    custoPorPessoa: 45,
    responsavelNome: 'Camila Toledo',
    pagos: 14,
    documentosPendentes: 0,
  },
]
