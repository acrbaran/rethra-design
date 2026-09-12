export function orderAgentsWithRethraDesignFirst<T extends { id: string }>(
  agents: readonly T[],
): T[] {
  const rethraDesignAgents: T[] = [];
  const otherAgents: T[] = [];
  for (const agent of agents) {
    if (agent.id === 'amr') {
      rethraDesignAgents.push(agent);
    } else {
      otherAgents.push(agent);
    }
  }
  return [...rethraDesignAgents, ...otherAgents];
}
