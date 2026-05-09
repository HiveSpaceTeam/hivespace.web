import { createRefreshService } from '@hivespace/shared'
import { config } from '@/config'

export default createRefreshService({
  authority: config.auth.oidc.authority,
  clientId: config.auth.oidc.clientId,
})
