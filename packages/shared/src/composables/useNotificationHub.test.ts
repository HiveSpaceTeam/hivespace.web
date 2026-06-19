import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ref } from 'vue'

const mockStart = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const mockStop = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const mockOn = jest.fn()
const mockOnreconnecting = jest.fn()
const mockOnreconnected = jest.fn()
const mockOnclose = jest.fn()

jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn().mockImplementation(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      on: mockOn,
      onreconnecting: mockOnreconnecting,
      onreconnected: mockOnreconnected,
      onclose: mockOnclose,
      start: mockStart,
      stop: mockStop,
    }),
  })),
  LogLevel: { Warning: 3 },
}))

jest.mock('../utils/cookie', () => ({
  getCookie: jest.fn(() => null),
  deleteCookie: jest.fn(),
}))

const mockCurrentUser = ref<{ id: string } | null>(null)
const mockCsrfToken = ref<string | null>(null)

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(() => ({
    currentUser: mockCurrentUser,
    csrfToken: mockCsrfToken,
  })),
}))

describe('useNotificationHub', () => {
  beforeEach(() => {
    mockCurrentUser.value = null
    mockCsrfToken.value = null
    mockStart.mockResolvedValue(undefined)
    mockStop.mockResolvedValue(undefined)
  })

  afterEach(() => {
    mockCurrentUser.value = null
  })

  it('should have disconnected status initially', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    const { connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)
    expect(connectionStatus.value).toBe('disconnected')
  })

  it('should stay disconnected when connecting without a user', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    const { connect, connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)

    await connect()

    expect(connectionStatus.value).toBe('disconnected')
    expect(mockStart).not.toHaveBeenCalled()
  })

  it('should transition to connected when connecting with a user', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    const { connect, connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)

    await connect()

    expect(connectionStatus.value).toBe('connected')
    expect(mockStart).toHaveBeenCalled()
  })

  it('should set status to disconnected after disconnecting', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    const { connect, disconnect, connectionStatus } = useNotificationHub(
      'http://localhost:5000',
      onReceive,
    )

    await connect()
    await disconnect()

    expect(connectionStatus.value).toBe('disconnected')
    expect(mockStop).toHaveBeenCalled()
  })

  it('should set status to error when connection fails', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    mockStart.mockRejectedValueOnce(new Error('Connection refused'))

    const { connect, connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)
    await connect()

    expect(connectionStatus.value).toBe('error')
  })

  it('should not throw when disconnecting without prior connect', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    const { disconnect } = useNotificationHub('http://localhost:5000', onReceive)

    await expect(disconnect()).resolves.not.toThrow()
  })

  it('should be idempotent on second connect call', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    const { connect } = useNotificationHub('http://localhost:5000', onReceive)

    await connect()
    await connect()

    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  it('should set connecting status in reconnecting callback', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    const { connect, connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)
    await connect()

    const reconnectingCb = mockOnreconnecting.mock.calls[0]?.[0] as (() => void) | undefined
    reconnectingCb?.()

    expect(connectionStatus.value).toBe('connecting')
  })

  it('should set connected status in reconnected callback', async () => {
    const { useNotificationHub } = await import('./useNotificationHub')
    const onReceive = jest.fn()
    mockCurrentUser.value = { id: 'user-001' } as typeof mockCurrentUser.value
    const { connect, connectionStatus } = useNotificationHub('http://localhost:5000', onReceive)
    await connect()

    const reconnectedCb = mockOnreconnected.mock.calls[0]?.[0] as (() => void) | undefined
    reconnectedCb?.()

    expect(connectionStatus.value).toBe('connected')
  })
})
