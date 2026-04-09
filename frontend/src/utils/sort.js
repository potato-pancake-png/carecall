export const riskOrder = { 위험: 3, 주의: 2, 정상: 1 };

export function sortByType(data, sortType, getStatus, getRisk) {
  return [...data].sort((a, b) => {
    if (sortType === 'default') return 0;

    const aResponded = getStatus(a);
    const bResponded = getStatus(b);

    const aRisk = riskOrder[getRisk(a)] || 0;
    const bRisk = riskOrder[getRisk(b)] || 0;

    if (sortType === 'response') {
      if (aResponded === bResponded) return 0;
      return aResponded ? 1 : -1;
    }

    if (sortType === 'risk') {
      return bRisk - aRisk;
    }

    return 0;
  });
}