import { z } from "zod"
import { Switch } from "@medusajs/ui"
import { forwardRef } from "react"

type MediaTypeSwitchProps = {
  disabled?: boolean
  name: string
  onBlur: () => void
  onChange: (checked: boolean) => void
  value: boolean
}

const MediaTypeSwitch = forwardRef<HTMLButtonElement, MediaTypeSwitchProps>(
  ({ value, onChange, ...props }, ref) => (
    <Switch
      {...props}
      checked={value === true}
      onCheckedChange={(checked) => onChange(checked === true)}
      ref={ref}
    />
  )
)

MediaTypeSwitch.displayName = "MediaTypeSwitch"

type MediaTypeFieldConfig = {
  model: "product"
  link: string[]
  forms: {
    zone: "create" | "edit"
    tab?: "general"
    fields: {
      media_fisica_digital: {
        label: string
        description: string
        component: typeof MediaTypeSwitch
        defaultValue: (
          data?: { metadata?: Record<string, unknown> | null }
        ) => boolean
        validation: z.ZodType<boolean>
      }
    }
  }[]
}

function unstable_defineCustomFieldsConfig(config: MediaTypeFieldConfig) {
  return config
}

export default unstable_defineCustomFieldsConfig({
  model: "product",
  // The field is stored in product metadata, so it has no linked fields.
  link: [],
  forms: [
    {
      zone: "create",
      tab: "general",
      fields: {
        media_fisica_digital: {
          label: "MIDIA FISICA E DIGITAL",
          description:
            "Permite que o cliente escolha entre adquirir este produto em mídia física ou digital.",
          component: MediaTypeSwitch,
          defaultValue: (data) =>
            data?.metadata?.media_fisica_digital === true,
          validation: z.boolean(),
        },
      },
    },
    {
      zone: "edit",
      fields: {
        media_fisica_digital: {
          label: "MIDIA FISICA E DIGITAL",
          description:
            "Permite que o cliente escolha entre adquirir este produto em mídia física ou digital.",
          component: MediaTypeSwitch,
          defaultValue: (data) =>
            data?.metadata?.media_fisica_digital === true,
          validation: z.boolean(),
        },
      },
    },
  ],
})
