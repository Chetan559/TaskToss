export const pickRandom = <T>(items: T[]): T => {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const parseListInput = (input: string): string[] => {
  const items = input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return Array.from(new Set(items));
};

export const createPairs = <T, U>(listA: T[], listB: U[]): Array<[T, U]> => {
  const shuffledA = shuffleArray(listA);
  const shuffledB = shuffleArray(listB);
  const pairs: Array<[T, U]> = [];

  const minLength = Math.min(shuffledA.length, shuffledB.length);
  for (let i = 0; i < minLength; i++) {
    pairs.push([shuffledA[i], shuffledB[i]]);
  }

  return pairs;
};
