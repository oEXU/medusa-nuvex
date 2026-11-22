/**
 * Local development convenience — ensures an admin user can log in to the
 * dashboard at /app using the configured ADMIN_PASSWORD.
 *
 *   npx medusa exec ./src/scripts/create-admin-user.ts
 *
 * Re-running it is safe: the user, auth identity, and password are reused
 * and the password is reset to ADMIN_PASSWORD each time.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"
const PROVIDER = "emailpass"

export default async function createAdminUser({ container }: ExecArgs) {

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const authService = container.resolve(Modules.AUTH)

  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: { email: ADMIN_EMAIL },
  })

  let user = users[0]

  if (!user) {
    const { result } = await createUsersWorkflow(container).run({
      input: { users: [{ email: ADMIN_EMAIL }] },
    })
    user = result[0]
    logger.info(`Created admin user ${ADMIN_EMAIL}.`)
  }

  const { data: authIdentities } = await query.graph({
    entity: "auth_identity",
    fields: [
      "id",
      "app_metadata",
      "provider_identities.provider",
      "provider_identities.entity_id",
    ],
  })

  const existingIdentity = authIdentities.find((identity) =>
    identity.provider_identities?.some(
      (providerIdentity) =>
        providerIdentity?.provider === PROVIDER &&
        providerIdentity?.entity_id === ADMIN_EMAIL,
    ),
  )

  if (existingIdentity) {
    const { error } = await authService.updateProvider(PROVIDER, {
      entity_id: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
    if (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error)
    }

    if (existingIdentity.app_metadata?.user_id !== user.id) {
      await authService.updateAuthIdentities({
        id: existingIdentity.id,
        app_metadata: { ...existingIdentity.app_metadata, user_id: user.id },
      })
    }

    logger.info(`Reset the password for admin ${ADMIN_EMAIL}.`)
    return
  }

  const { authIdentity, error } = await authService.register(PROVIDER, {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })

  if (error || !authIdentity) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      error ?? "Could not register the admin auth identity.",
    )
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: { user_id: user.id },
  })

  logger.info(`Created admin login ${ADMIN_EMAIL}.`)
}
