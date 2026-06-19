import { describe, expect, it, jest } from '@jest/globals'
import { createFakeSignalRHub } from './notification'

describe('createFakeSignalRHub', () => {
  it('invocations_IsEmptyInitially', () => {
    const hub = createFakeSignalRHub()
    expect(hub.invocations).toHaveLength(0)
  })

  it('invoke_RecordsInvocation', async () => {
    const hub = createFakeSignalRHub()
    await hub.invoke('SendMessage', 'hello', 'world')
    expect(hub.invocations).toHaveLength(1)
    expect(hub.invocations[0]!.method).toBe('SendMessage')
    expect(hub.invocations[0]!.args).toEqual(['hello', 'world'])
  })

  it('emit_TriggersRegisteredHandlers', () => {
    const hub = createFakeSignalRHub()
    const received: unknown[] = []

    hub.on('ReceiveNotification', (event) => {
      received.push(event)
    })
    hub.emit('ReceiveNotification', { id: 'notif-001', eventType: 'order.placed' })

    expect(received).toHaveLength(1)
    expect((received[0] as { id: string }).id).toBe('notif-001')
  })

  it('emit_RecordsInvocation', () => {
    const hub = createFakeSignalRHub()
    hub.emit('ReceiveNotification', { id: 'notif-001' })
    expect(hub.invocations).toHaveLength(1)
  })

  it('on_MultipleHandlers_AllTriggered', () => {
    const hub = createFakeSignalRHub()
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    hub.on('TestEvent', handler1 as (args: unknown) => void)
    hub.on('TestEvent', handler2 as (args: unknown) => void)
    hub.emit('TestEvent', { data: 'test' })

    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('off_RemovesHandlers', () => {
    const hub = createFakeSignalRHub()
    const handler = jest.fn()

    hub.on('TestEvent', handler as (args: unknown) => void)
    hub.off('TestEvent')
    hub.emit('TestEvent', { data: 'test' })

    expect(handler).not.toHaveBeenCalled()
  })
})
