/** Returns candidate localStorage keys for legacy key format migration */
export const getCandidateKeys = (key: string): string[] => {
  const baseKey = key.replace(/-v\d+$/, '').replace(/-new$/, '');
  return [
    key,
    `ksebe-img-${key}`,
    baseKey,
    `ksebe-img-${baseKey}`,
    `${baseKey}-v4`,
    `ksebe-img-${baseKey}-v4`,
  ];
};
