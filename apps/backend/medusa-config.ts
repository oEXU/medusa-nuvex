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
  ],
})
