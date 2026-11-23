/** Tipos do motor PONTE — tudo aqui é determinístico; a IA só entra depois, para sugerir. */

export type Modelo = "55" | "65" | "ambos";

/** Linha do cadastro de produtos, já normalizada. Campos ausentes = "". */
export interface Produto {
  linha: number;            // número da linha no arquivo original (1 = primeira linha de dados)
  sku: string;
  descricao: string;
  ncm: string;              // só dígitos
  cest: string;             // só dígitos
  cst: string;              // CST do IBS/CBS (3 dígitos)
  cClassTrib: string;       // 6 dígitos
  gtin: string;             // como veio (pode ser "SEM GTIN")
}

/** bloqueia = a SEFAZ rejeita a nota · risco = autoriza, mas expõe a autuação · oportunidade = pode estar pagando a mais · pendencia = obrigação ainda não validada pela SEFAZ */
export type Severidade = "bloqueia" | "risco" | "oportunidade" | "pendencia" | "aviso";

/** OBSERVADO = fato verificável contra a tabela oficial · INFERIDO = depende de confirmar uma condição do produto */
export type Evidencia = "OBSERVADO" | "INFERIDO";

export type RegraId =
  | "NCM_AUSENTE" | "NCM_INCOMPLETO" | "NCM_INEXISTENTE"
  | "IBSCBS_AUSENTE" | "IBSCBS_PARCIAL" | "CST_INEXISTENTE" | "CCLASSTRIB_INEXISTENTE"
  | "CST_X_CCLASSTRIB" | "CCLASSTRIB_MODELO" | "CCLASSTRIB_VIGENCIA"
  | "BENEFICIO_SEM_ANEXO" | "BENEFICIO_VEDADO" | "BENEFICIO_CONDICAO"
  | "REDUCAO_NAO_APROVEITADA"
  | "GTIN_INVALIDO" | "CEST_FORMATO"
  | "SKU_DUPLICADO" | "GTIN_NCM_DIVERGENTE" | "ZERO_RESTAURADO";

export interface Sugestao {
  cst?: string;
  cClassTrib?: string;
  gtin?: string;
  /** Por que essa sugestão — texto da tabela oficial que a sustenta. */
  fundamento?: string;
  origem: "regra" | "ia";
}

export interface Achado {
  id: string;
  linha: number;
  sku: string;
  regra: RegraId;
  severidade: Severidade;
  evidencia: Evidencia;
  campo: keyof Produto | "grupo IBS/CBS";
  valorAtual: string;
  mensagem: string;
  /** Rejeição da SEFAZ ou norma que fundamenta o achado. */
  base: string;
  sugestao?: Sugestao;
  /** Opções candidatas (para benefícios: cClassTrib possíveis pelo anexo). */
  candidatos?: Candidato[];
}

export interface Candidato {
  cClassTrib: string;
  cst: string;
  nome: string;
  condicao: string | null;
  item: string | null;
  anexo: string | null;
  percRedIbs: number;
  percRedCbs: number;
}

export interface Opcoes {
  modelo: Modelo;
  /** Data de referência (AAAA-MM-DD) para vigência das tabelas. */
  dataRef: string;
}

export interface Resumo {
  produtos: number;
  produtosComBloqueio: number;
  produtosComRisco: number;
  produtosComOportunidade: number;
  produtosLimpos: number;
  porRegra: Partial<Record<RegraId, number>>;
  porSeveridade: Record<Severidade, number>;
}

export interface Auditoria {
  opcoes: Opcoes;
  achados: Achado[];
  resumo: Resumo;
  versaoTabelas: { cclasstrib: string; ncm: string };
  motor: string;
}
