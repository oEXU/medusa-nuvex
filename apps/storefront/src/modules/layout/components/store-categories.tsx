import Image from "next/image"
import type { SVGProps } from "react"

export const storeCategories = [
  {
    id: "categoria-pc-perifericos",
    label: "PC e Periféricos",
    description: "Hardware, acessórios e setup",
    icon: "pc",
  },
  {
    id: "categoria-ps5",
    label: "PS5",
    description: "PlayStation 5",
    icon: "playstation",
  },
  {
    id: "categoria-xbox",
    label: "XBOX",
    description: "Consoles e jogos Xbox",
    icon: "xbox",
  },
  {
    id: "categoria-switch",
    label: "Nintendo Switch",
    description: "Jogue em casa ou onde quiser",
    icon: "switch",
  },
  {
    id: "categoria-geek",
    label: "Geek",
    description: "Colecionáveis e cultura pop",
    icon: "geek",
  },
] as const

type StoreCategoryIconProps = Pick<SVGProps<SVGSVGElement>, "className"> & {
  name: (typeof storeCategories)[number]["icon"]
}

export function StoreCategoryIcon({
  name,
  className,
}: StoreCategoryIconProps) {
  const imageSources = {
    playstation: "/category-ps5.png",
    xbox: "/category-xbox.png",
    switch: "/category-switch.png",
    geek: "/category-geek.png",
  }

  if (name !== "pc") {
    return (
      <Image
        src={imageSources[name]}
        alt=""
        aria-hidden="true"
        width={240}
        height={180}
        className={className}
      />
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 36"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      className={className}
    >
      <rect x="4" y="3" width="29" height="22" rx="2.5" />
      <path d="M12 32h13m-6.5-7v7m15-19h9v18h-9zM8 20h21" />
      <circle cx="38.5" cy="27.5" r=".7" fill="currentColor" />
    </svg>
  )
}
