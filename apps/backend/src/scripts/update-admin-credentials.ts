import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

const TARGET_EMAIL = process.env.ADMIN_EMAIL || "admin@sawarin.cc"
const TARGET_PASSWORD = process.env.ADMIN_PASSWORD || "Justice99"
const PROVIDER = "emailpass"

export default async function updateAdminCredentials({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const authService = container.resolve(Modules.AUTH)

  logger.info(`Setting up admin user: ${TARGET_EMAIL}...`)

  // 1. Fetch all users
  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email", "first_name", "last_name"],
    pagination: { take: 1000 },
  })

  let user = users.find((u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase())

  if (!user) {
    const existingAdmin = users.find((u) => u.email?.includes("admin@"))
    if (existingAdmin) {
      user = existingAdmin
      logger.info(`Using existing admin user [${existingAdmin.id}].`)
    } else {
      const { result } = await createUsersWorkflow(container).run({
        input: {
          users: [
            {
              email: TARGET_EMAIL,
              first_name: "Admin",
              last_name: "Sawarin",
            },
          ],
        },
      })
      user = result[0]
      logger.info(`Created new user [${user.id}] with email ${TARGET_EMAIL}.`)
    }
  } else {
    logger.info(`User [${user.id}] already has email ${TARGET_EMAIL}.`)
  }

  if (!user) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Could not find or create the admin user for ${TARGET_EMAIL}.`
    )
  }

  // 2. Fetch all auth identities and provider identities
  const { data: authIdentities } = await query.graph({
    entity: "auth_identity",
    fields: [
      "id",
      "app_metadata",
      "provider_identities.id",
      "provider_identities.provider",
      "provider_identities.entity_id",
    ],
    pagination: { take: 1000 },
  })

  const targetIdentity = authIdentities.find((identity) =>
    identity.provider_identities?.some(
      (pi) =>
        pi?.provider === PROVIDER &&
        pi?.entity_id?.toLowerCase() === TARGET_EMAIL.toLowerCase()
    )
  )

  if (targetIdentity) {
    // Reset password for target email
    const { error } = await authService.updateProvider(PROVIDER, {
      entity_id: TARGET_EMAIL,
      password: TARGET_PASSWORD,
    })
    if (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error)
    }

    if (targetIdentity.app_metadata?.user_id !== user.id) {
      await authService.updateAuthIdentities({
        id: targetIdentity.id,
        app_metadata: { ...targetIdentity.app_metadata, user_id: user.id },
      })
    }
    logger.info(`Password successfully updated for ${TARGET_EMAIL}.`)
  } else {
    // Register new provider identity for target email
    const { authIdentity, error } = await authService.register(PROVIDER, {
      body: { email: TARGET_EMAIL, password: TARGET_PASSWORD },
    })

    if (error || !authIdentity) {
      // If error is because identity already exists, try updateProvider
      logger.warn(`Register returned: ${error}, attempting provider update...`)
      const updateResult = await authService.updateProvider(PROVIDER, {
        entity_id: TARGET_EMAIL,
        password: TARGET_PASSWORD,
      })
      if (updateResult.error) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          updateResult.error
        )
      }
    } else {
      await authService.updateAuthIdentities({
        id: authIdentity.id,
        app_metadata: { user_id: user.id },
      })
      logger.info(`Registered provider identity and linked to user ${user.id}.`)
    }
  }

  // Remove stale email/password logins left behind when an existing admin's
  // email was changed. Keep the auth identity itself so any other providers
  // and user links remain intact.
  const legacyProviderIdentityIds = authIdentities
    .filter((identity) => identity.app_metadata?.user_id === user.id)
    .flatMap((identity) => identity.provider_identities ?? [])
    .filter(
      (providerIdentity) =>
        providerIdentity?.provider === PROVIDER &&
        providerIdentity.entity_id?.toLowerCase() !== TARGET_EMAIL.toLowerCase()
    )
    .map((providerIdentity) => providerIdentity?.id)
    .filter((id): id is string => Boolean(id))

  if (legacyProviderIdentityIds.length) {
    await authService.deleteProviderIdentities(legacyProviderIdentityIds)
    logger.info(
      `Removed ${legacyProviderIdentityIds.length} outdated admin login(s).`
    )
  }

  logger.info(`Admin credentials successfully configured for ${TARGET_EMAIL}!`)
}
