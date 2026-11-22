import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    vite: () => ({
      plugins: [
        {
          name: "NuveX-admin-branding",
          transformIndexHtml(html) {
            return html.replace(
              "</head>",
              '  <link rel="icon" type="image/x-icon" href="/static/thunderbird1.ico" />\n  <link rel="shortcut icon" type="image/x-icon" href="/static/thunderbird1.ico" />\n  <link rel="stylesheet" href="/static/admin-branding.css" />\n</head>'
            )
          },
        },
      ],
    }),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.ENABLE_REDIS === "true" ? process.env.REDIS_URL : undefined,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/featured-product",
    },
    {
      resolve: "./src/modules/promo-banner",
    },
    {
      resolve: "./src/modules/support-ticket",
    },
    ...(process.env.REDIS_URL && process.env.ENABLE_REDIS === "true"
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: {
              redis: {
                redisUrl: process.env.REDIS_URL,
              },
            },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/locking-redis",
                  id: "locking-redis",
                  is_default: true,
                  options: {
                    redisUrl: process.env.REDIS_URL,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
