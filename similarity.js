// Normaliza texto: minúsculas, sem acentos, sem pontuação
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

// Distância de Levenshtein entre duas strings
function levenshtein(a, b) {
  const matriz = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + custo
      );
    }
  }

  return matriz[a.length][b.length];
}

// Retorna uma nota de 0 a 100 comparando o que foi dito com o esperado
export function calcularNota(esperado, transcrito) {
  const a = normalizar(esperado);
  const b = normalizar(transcrito || "");

  if (!b) return 0;

  const distancia = levenshtein(a, b);
  const maiorTamanho = Math.max(a.length, b.length) || 1;
  const nota = Math.max(0, (1 - distancia / maiorTamanho) * 100);

  return Math.round(nota);
}
