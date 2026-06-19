type Invocation = {
  method: string
  args: unknown[]
}

type HubHandler = (args: unknown) => void

export const createFakeSignalRHub = () => {
  const invocations: Invocation[] = []
  const handlers = new Map<string, HubHandler[]>()

  return {
    invocations,
    on(method: string, handler: HubHandler) {
      handlers.set(method, [...(handlers.get(method) ?? []), handler])
    },
    off(method: string) {
      handlers.delete(method)
    },
    async invoke(method: string, ...args: unknown[]) {
      invocations.push({ method, args })
    },
    emit(method: string, args: unknown): void {
      invocations.push({ method, args: [args] })
      handlers.get(method)?.forEach(handler => handler(args))
    },
  }
}
