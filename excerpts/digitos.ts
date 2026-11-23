/** Dígitos verificadores: GTIN (GS1), CNPJ (numérico e alfanumérico — IN RFB, a partir de jul/2026) e CPF. */

export const soDigitos = (s: string) => s.replace(/\D/g, "");

/** GTIN-8/12/13/14: módulo 10 com pesos 3/1 a partir da direita (sem o dígito). */
export function gtinValido(gtin: string): boolean {
  const g = gtin.trim();
  if (!/^\d+$/.test(g) || ![8, 12, 13, 14].includes(g.length)) return false;
  const corpo = g.slice(0, -1);
  let soma = 0;
  for (let i = 0; i < corpo.length; i++) {
    const d = corpo.charCodeAt(corpo.length - 1 - i) - 48;
    soma += d * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (soma % 10)) % 10 === Number(g[g.length - 1]);
}

export function gtinDigito(corpo: string): number {
  let soma = 0;
  for (let i = 0; i < corpo.length; i++) soma += (corpo.charCodeAt(corpo.length - 1 - i) - 48) * (i % 2 === 0 ? 3 : 1);
  return (10 - (soma % 10)) % 10;
}

/** "SEM GTIN" (ou vazio) é aceito pela NF-e para produto sem código de barras. */
export const semGtin = (g: string) => g.trim() === "" || /^sem\s*gtin$/i.test(g.trim());

const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function dvCnpj(base: string, pesos: number[]): number {
  let soma = 0;
  for (let i = 0; i < pesos.length; i++) soma += (base.charCodeAt(i) - 48) * pesos[i];
  const r = soma % 11;
  return r < 2 ? 0 : 11 - r;
}

/** CNPJ numérico ou alfanumérico: 12 posições [0-9A-Z] + 2 dígitos. Valor de cada caractere = ASCII − 48. */
export function normalizaCnpj(s: string): string {
  return s.toUpperCase().replace(/[.\-/\s]/g, "");
}

export function cnpjValido(entrada: string): boolean {
  const c = normalizaCnpj(entrada);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(c)) return false;
  if (/^(\d)\1{13}$/.test(c)) return false;
  const d1 = dvCnpj(c.slice(0, 12), PESOS_DV1);
  const d2 = dvCnpj(c.slice(0, 12) + d1, PESOS_DV2);
  return c.endsWith(`${d1}${d2}`);
}

export function cnpjComDv(base12: string): string {
  const d1 = dvCnpj(base12, PESOS_DV1);
  return base12 + d1 + dvCnpj(base12 + d1, PESOS_DV2);
}

export function cpfValido(entrada: string): boolean {
  const c = soDigitos(entrada);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(c[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}
