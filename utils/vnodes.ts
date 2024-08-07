export function getEventName(event: string): string {
  return `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;
}

export function withEventsDirective(
  events: Record<string, Function>
): Record<string, Function> {
  const results: Record<string, Function> = {};
  const keys = Object.keys(events);
  for (const key of keys) {
    results[getEventName(key)] = events[key];
  }
  return results;
}
