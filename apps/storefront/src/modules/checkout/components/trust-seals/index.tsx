import Image from "next/image"

const seals = [
  {
    id: "buscape",
    alt: "Empresa reconhecida Buscapé",
    src: "/security-buscape.png",
  },
  {
    id: "ebit",
    alt: "e-bit excelente",
    src: "/security-ebit-excellent.png",
  },
  {
    id: "reclame-aqui",
    alt: "Otimo no Reclame Aqui",
    src: "/security-reclame-aqui.jpg",
  },
]

export default function TrustSeals() {
  return (
    <section aria-label="Selos de segurança" className="py-8 small:py-10">
      <div className="content-container">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-6 small:gap-x-14">
          {seals.map((seal) => (
            <div key={seal.id} className="flex h-16 items-center justify-center">
              <Image
                src={seal.src}
                alt={seal.alt}
                width={340}
                height={140}
                unoptimized
                className="max-h-16 w-auto max-w-52 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
