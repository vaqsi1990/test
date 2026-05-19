export function parseFromAddress(value, defaultName = 'Обратная связь') {
  const trimmed = String(value).trim();
  const withName = trimmed.match(/^"([^"]+)"\s*<([^>]+)>$/);
  if (withName) {
    return { name: withName[1].trim(), email: withName[2].trim() };
  }

  const angle = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (angle) {
    return { name: angle[1].trim(), email: angle[2].trim() };
  }

  return { name: defaultName, email: trimmed };
}
