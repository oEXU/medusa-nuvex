import {
  GTA_VI_ULTIMATE_EDITION_PRIMARY_HANDLE,
  GTA_VI_ULTIMATE_EDITION_SECONDARY_HANDLE,
} from "./mock-products"

export type ProductReview = {
  id: string
  author: string
  /** Optional avatar image URL; falls back to a user icon. */
  avatar?: string
  /** Order number the review refers to, when provided by the customer. */
  orderNumber?: string
  rating: number
  message: string
}

const GTA_REVIEW_AUTHORS = [
  "Rafael Souza",
  "Camila Ferreira",
  "Bruno Almeida",
  "Juliana Martins",
  "Lucas Oliveira",
  "Patrícia Gomes",
  "Thiago Ribeiro",
  "Fernanda Costa",
  "Gabriel Santos",
  "Amanda Rocha",
  "Rodrigo Lima",
  "Beatriz Alves",
  "Felipe Carvalho",
  "Larissa Mendes",
  "Diego Barbosa",
  "Mariana Araújo",
  "Vitor Nascimento",
  "Carolina Dias",
  "André Moreira",
  "Natália Castro",
  "Guilherme Pinto",
  "Renata Teixeira",
  "Marcelo Cardoso",
  "Isabela Freitas",
]

/** Creative gamer nicknames used across all non-GTA products. */
const GAMER_AUTHORS = [
  "xXDarkSniperXx",
  "ProGamer_BR",
  "NitroVolt99",
  "PixelKnight",
  "GhostByte",
  "LaserFox_",
  "StormRaider7",
  "CyberWolf_BR",
  "ZeroLatency",
  "NeonBlaze",
  "TurboShot_",
  "ShadowRex",
  "BlitzMaster",
  "QuantumPlay",
  "MegaGrind",
  "VipeR_GG",
  "FrostByte42",
  "LegendKiller",
  "AceOfSpades_",
  "RapidFire_BR",
  "DarkMagician",
  "OverclockHero",
  "HeadshotKing",
  "NuclearDave",
  "SpeedDemon_",
  "IronFist_GG",
  "TacticalNuke",
  "PhoenixRise",
  "OmegaStrike",
  "GigaChad_BR",
]

const FIVE_STAR_MESSAGES = [
  "Chegou no e-mail o código, ativou na hora e funcionou perfeitamente.",
  "Compra segura! Recebi o código rapidinho e já baixei o jogo.",
  "Chegou na hora, código válido e sem nenhum problema.",
  "Entrega muito rápida, o código chegou no e-mail em poucos minutos.",
  "Loja confiável, pagamento seguro e código entregue na hora.",
  "Recebi o código no e-mail logo após a confirmação da compra, tudo certo.",
  "Atendimento ótimo e entrega instantânea, recomendo muito a loja.",
  "Comprei e o código chegou na hora, resgatei sem qualquer dificuldade.",
  "Processo de compra simples, seguro e o código chegou rápido.",
  "Código original, entrega no e-mail em minutos. Voltarei a comprar com certeza.",
  "Melhor preço que encontrei, o código chegou certinho no e-mail.",
  "Compra super tranquila, recebi o código e o jogo está rodando perfeitamente.",
  "Entrega imediata! O suporte respondeu rápido e foi super atencioso.",
  "Já comprei várias vezes nesta loja, sempre chega no e-mail bem rápido.",
]

const FOUR_STAR_MESSAGES = [
  "O código chegou no e-mail em cerca de meia hora, um pouco mais demorado do que o esperado, mas funcionou perfeitamente.",
  "Demorou cerca de 40 minutos para o código chegar no e-mail, mas ativou sem problemas.",
  "Recebi o código em quase uma hora, demorou um pouco além da expectativa, mas valeu a pena.",
  "O código demorou cerca de 20 minutos para chegar no e-mail, mas ativou de primeira.",
  "Demorou um pouquinho para receber o código, mas ele chegou e ativou sem nenhuma complicação.",
  "O envio levou cerca de 50 minutos até chegar no e-mail, mas recebi tudo certo.",
  "O código chegou em cerca de uma hora. Demorou um pouco, mas ativou com sucesso.",
  "Esperei cerca de 45 minutos pelo código no e-mail, mas chegou tudo certinho e ativou de primeira.",
]

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

/** Deterministic PRNG used by the fallback review builder. */
function createRandom(seed: number) {
  let state = seed

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Decimal ratings between 4.3 and 5.0, deterministically chosen per review id.
 * Most reviews get 5.0; a portion get 4.3–4.9 so the average lands in range.
 */
const DECIMAL_RATINGS = [5.0, 5.0, 5.0, 5.0, 4.9, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3]

function pickDecimalRating(seed: number): number {
  return DECIMAL_RATINGS[seed % DECIMAL_RATINGS.length]
}

function buildGtaReviews(prefix: string, total: number): ProductReview[] {
  const fourStarCount = Math.round(total / 3)
  const fiveStarCount = total - fourStarCount

  return Array.from({ length: total }, (_, index) => {
    const isFiveStars = index < fiveStarCount
    const messages = isFiveStars ? FIVE_STAR_MESSAGES : FOUR_STAR_MESSAGES
    const baseMessage = messages[index % messages.length]
    const id = `${prefix}-review-${index + 1}`

    return {
      id,
      author: GTA_REVIEW_AUTHORS[index % GTA_REVIEW_AUTHORS.length],
      rating: pickDecimalRating(index + (isFiveStars ? 0 : 4)),
      message: baseMessage,
    }
  })
}

const FC_2026_REVIEW_MESSAGES = [
  "Jogo perfeito! Comprei, recebi o código na hora e já estava jogando em minutos. Vale cada centavo.",
  "Melhor jogo de futebol da atualidade! O código chegou rápido e ativou sem nenhum problema.",
  "Gráficos incríveis e jogabilidade muito fluida. Recomendo muito, entrega imediata.",
  "Comprei de madrugada e o código chegou na mesma hora. Já estava jogando antes das 3h da manhã.",
  "Muito bom, compra rápida e totalmente segura. Código original sem nenhum erro na ativação.",
  "Finalmente uma edição que vale muito a pena! A loja entregou o código com uma agilidade impressionante.",
  "Meu filho pediu e chegou em minutos. Ele ficou super feliz, produto original e funcionou na hora.",
  "Excelente! O código chegou certinho, ativou de primeira e já estou jogando no Ultimate Team.",
  "Compra nota 10! Entrega instantânea e o jogo é simplesmente sensacional.",
  "Já é a terceira vez que compro aqui. Sempre rápido e sempre confiável. Recomendo com certeza.",
  "Não esperava que a entrega fosse tão rápida. Código 100% válido e ativação sem complicação.",
  "Atendimento excelente quando tive uma dúvida. O código chegou rapidinho no e-mail.",
]

const FC_2026_REVIEW_RATINGS = [5.0, 5.0, 4.9, 5.0, 4.8, 5.0, 4.9, 5.0, 4.7, 5.0, 4.6, 4.8]

const TLOU2_REVIEW_MESSAGES = [
  "Uma das melhores narrativas de todos os tempos. O código chegou rápido e ativou perfeitamente.",
  "Que obra-prima! Recebi o código em minutos e a história me impactou de verdade.",
  "Jogo incrível com gráficos espetaculares e entrega super rápida. Já zerei e a história continua marcando.",
  "Comprei sem hesitar. Código original, entrega imediata e uma história que vale cada centavo.",
  "A Naughty Dog criou algo único. A loja também fez tudo certo com a entrega imediata.",
  "Fiquei com receio por ser código digital, mas a experiência foi perfeita. Código totalmente válido.",
  "Jogo envolvente do início ao fim. Compra tranquila e o código chegou muito rápido.",
  "Para quem busca uma história profunda e emocionante, este é o jogo. A entrega foi impecável.",
  "Já zerei duas vezes! Sempre compro nesta loja e nunca tive problemas.",
  "O código chegou no e-mail antes mesmo de eu terminar meu café. Excelente serviço!",
]

const TLOU2_REVIEW_RATINGS = [5.0, 4.9, 5.0, 5.0, 4.8, 4.7, 5.0, 4.9, 5.0, 4.6]

const ASSASSINS_REVIEW_MESSAGES = [
  "Jogo gigantesco com muitas horas de conteúdo. O código chegou rapidinho e ativou sem erro.",
  "A Ubisoft caprichou nessa ambientação! A loja entregou na hora, como sempre.",
  "Explorar a Era Viking é uma experiência incrível. Recebi o código no e-mail em poucos minutos.",
  "Muito bom! Mundo aberto enorme e combate muito satisfatório. Entrega rápida e produto original.",
  "Já tinha jogado antes e comprei agora para o PS5. Ativação perfeita e rápida.",
  "O código chegou bem rápido e ativei de primeira. O jogo vale muito a pena.",
  "Achei que pudesse demorar, mas chegou na hora. Estou super satisfeito com a compra.",
  "Valhalla possui um mapa imenso e conteúdo para vários meses. Compra altamente recomendada.",
  "Código original, entrega imediata e o jogo não decepciona em nada. Nota máxima!",
  "Nunca tive problemas comprando aqui. Sempre chega rápido e funciona logo na primeira tentativa.",
  "O jogo é simplesmente fantástico! A entrega foi pontual, assim como nas minhas outras compras.",
]

const ASSASSINS_REVIEW_RATINGS = [5.0, 4.9, 5.0, 4.8, 5.0, 4.7, 4.9, 5.0, 4.6, 5.0, 4.8]

const RDR2_REVIEW_MESSAGES = [
  "Uma das maiores obras da história dos videogames. Comprei o código e chegou imediatamente.",
  "Arthur Morgan é um personagem inesquecível. Código original e entrega imediata.",
  "Nunca joguei nada tão imersivo. Recebi o código em minutos e já estava explorando o Velho Oeste.",
  "A Rockstar fez algo histórico com este jogo. O suporte e a entrega da loja foram impecáveis.",
  "O código chegou no e-mail rapidinho. O jogo em si é uma verdadeira obra de arte.",
  "Comprei para jogar no feriado e o código chegou quase que instantaneamente. Perfeito!",
  "Excelente experiência! Código válido, funcionou de primeira e o jogo é maravilhoso.",
  "Entrega super rápida e produto 100% original. Red Dead Redemption 2 é indispensável.",
  "Já tinha zerado em outro console e comprei novamente para jogar no PS5. Ativação sem nenhum problema.",
]

const RDR2_REVIEW_RATINGS = [5.0, 5.0, 4.9, 4.8, 5.0, 4.9, 4.7, 5.0, 4.6]

function buildGameReviews(
  prefix: string,
  authors: string[],
  messages: string[],
  ratings: number[]
): ProductReview[] {
  return messages.map((message, index) => {
    const id = `${prefix}-review-${index + 1}`
    return {
      id,
      author: authors[index % authors.length],
      rating: ratings[index % ratings.length],
      message,
    }
  })
}

export const MOCK_REVIEWS: Record<string, ProductReview[]> = {
  [GTA_VI_ULTIMATE_EDITION_PRIMARY_HANDLE]: buildGtaReviews(
    "gta-ultimate-primary",
    20
  ),
  [GTA_VI_ULTIMATE_EDITION_SECONDARY_HANDLE]: buildGtaReviews(
    "gta-ultimate-secondary",
    14
  ),
  "fc-2026": buildGameReviews(
    "fc-2026",
    GAMER_AUTHORS,
    FC_2026_REVIEW_MESSAGES,
    FC_2026_REVIEW_RATINGS
  ),
  "the-last-of-us-part-ii": buildGameReviews(
    "tlou2",
    GAMER_AUTHORS.slice(5),
    TLOU2_REVIEW_MESSAGES,
    TLOU2_REVIEW_RATINGS
  ),
  "assassins-creed-valhalla": buildGameReviews(
    "acv",
    GAMER_AUTHORS.slice(10),
    ASSASSINS_REVIEW_MESSAGES,
    ASSASSINS_REVIEW_RATINGS
  ),
  "red-dead-redemption-2": buildGameReviews(
    "rdr2",
    GAMER_AUTHORS.slice(15),
    RDR2_REVIEW_MESSAGES,
    RDR2_REVIEW_RATINGS
  ),
}

export function getMockReviews(handle: string): ProductReview[] {
  return MOCK_REVIEWS[handle] ?? buildFallbackReviews(handle)
}

/**
 * Generates a deterministic set of reviews for any product handle that is not
 * explicitly mapped in MOCK_REVIEWS. The same handle always produces the same
 * reviews (same authors, ratings and messages), so SSR and client renders
 * never disagree. All ratings are between 4.3 and 5.0 as required.
 */
function buildFallbackReviews(handle: string): ProductReview[] {
  const seed = hashString(handle)
  const random = createRandom(seed)

  // Between 5 and 12 reviews, deterministically chosen from the handle.
  const count = 5 + Math.floor(random() * 8)

  const allAuthors = [...GTA_REVIEW_AUTHORS, ...GAMER_AUTHORS]
  const allMessages = [...FIVE_STAR_MESSAGES, ...FOUR_STAR_MESSAGES]

  return Array.from({ length: count }, (_, index) => {
    const id = `${handle}-fallback-${index + 1}`
    // Pick author, message and rating deterministically.
    const authorIndex = Math.floor(random() * allAuthors.length)
    const messageIndex = Math.floor(random() * allMessages.length)
    const ratingIndex = Math.floor(random() * DECIMAL_RATINGS.length)
    const baseMessage = allMessages[messageIndex]

    return {
      id,
      author: allAuthors[authorIndex],
      rating: DECIMAL_RATINGS[ratingIndex],
      message: baseMessage,
    }
  })
}