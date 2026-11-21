import Image from "next/image"
import type { SVGProps } from "react"

export const storeCategories = [
  {
    id: "categoria-pc-perifericos",
    label: "PC",
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
  }

  if (name !== "pc") {
    return (
      <Image
        src={imageSources[name]}
        alt=""
        width={32}
        height={32}
        className={className}
        aria-hidden="true"
      />
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 20h10M12 16v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
