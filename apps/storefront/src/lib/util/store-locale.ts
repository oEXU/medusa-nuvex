export type StoreLanguage = "pt-BR" | "en-US"

export type TranslationKey =
  | "announcement"
  | "login"
  | "register"
  | "categories"
  | "home"
  | "platforms"
  | "games"
  | "contact"
  | "search"
  | "cart"
  | "openCategories"
  | "closeCategories"
  | "explore"
  | "menuTitle"
  | "menuSubtitle"
  | "storeCategories"
  | "moreCategories"
  | "pcPeripherals"
  | "ps5"
  | "xbox"
  | "switch"
  | "geek"
  | "pcDescription"
  | "ps5Description"
  | "xboxDescription"
  | "switchDescription"
  | "geekDescription"
  | "nuveXBrazil"
  | "nextLevel"
  | "nextPhase"
  | "heroDescription"
  | "meetNuvex"
  | "explorePlatforms"
  | "madeForGamers"
  | "brazilFocus"
  | "platformEyebrow"
  | "platformHeading"
  | "platformDescription"
  | "platformEmptyBefore"
  | "platformEmptyAfter"
  | "trustStatement"
  | "storePromise"
  | "experienceInProgress"
  | "catalog"
  | "chooseAdventure"
  | "catalogPreparing"
  | "catalogDescription"
  | "comingSoon"
  | "footerDescription"
  | "nextPhaseComing"
  | "contactHelp"
  | "contactUs"
  | "paymentMethods"
  | "secureShopping"
  | "certifications"
  | "paymentNotice"
  | "customerService"
  | "information"
  | "myAccount"
  | "privacy"
  | "terms"
  | "returns"
  | "shipping"
  | "copyright"
  | "madeForGamersFooter"
  | "summary"
  | "goToCheckout"
  | "emptyCartMessage"
  | "exploreProducts"
  | "backToCart"
  | "back"
  | "store"
  | "shippingAddress"
  | "billingAddress"
  | "continueDelivery"
  | "edit"
  | "contactLabel"
  | "sameBillingAddress"
  | "firstName"
  | "lastName"
  | "address"
  | "company"
  | "postalCode"
  | "city"
  | "email"
  | "phone"
  | "chooseAddress"
  | "inYourCart"
  | "review"
  | "continueReview"
  | "enterPaymentDetails"
  | "placeOrderNotice"
  | "subtotalExclShippingTaxes"
  | "subtotal"
  | "shippingLabel"
  | "discount"
  | "taxes"
  | "total"
  | "quantity"
  | "remove"
  | "goToCart"
  | "emptyBag"
  | "goToProducts"
  | "item"
  | "price"
  | "alreadyAccount"
  | "signInBetter"
  | "signIn"
  | "shippingMethod"
  | "delivery"
  | "deliveryInstruction"
  | "pickupOrder"
  | "chooseNearbyStore"
  | "continuePayment"
  | "method"
  | "payment"
  | "paymentMethod"
  | "paymentDetails"
  | "anotherStep"
  | "country"
  | "giftCard"
  | "enterTheGame"
  | "yourWay"
  | "getReady"
  | "nextPhaseArriving"
  | "companyBelongsTo"
  | "companyTaxId"
  | "companyAddress"
  | "companyPhoneLabel"
  | "xpBoost"
  | "playerLevel"
  | "nextLevelTier"
  | "achievementUnlocked"
  | "rareDrop"
  | "lowLatency"

const translations: Record<StoreLanguage, Record<TranslationKey, string>> = {
  "pt-BR": {
    announcement: "Ofertas, drops e lançamentos · Novidades selecionadas para você",
    login: "Olá! Faça login",
    register: "ou cadastre-se",
    categories: "Categorias",
    home: "Início",
    platforms: "Plataformas",
    games: "Jogos",
    contact: "Fale conosco",
    search: "O que você está buscando?",
    cart: "Sacola",
    openCategories: "Abrir menu de categorias",
    closeCategories: "Fechar menu de categorias",
    explore: "Explore a NuveX",
    menuTitle: "Encontre sua próxima fase",
    menuSubtitle: "Categorias da loja",
    storeCategories: "Mais categorias e novidades em breve.",
    moreCategories: "Categorias da loja",
    pcPeripherals: "PC e Periféricos",
    ps5: "PS5",
    xbox: "XBOX",
    switch: "Nintendo Switch",
    geek: "Geek",
    pcDescription: "Hardware, acessórios e setup",
    ps5Description: "PlayStation 5",
    xboxDescription: "Consoles e jogos Xbox",
    switchDescription: "Jogue em casa ou onde quiser",
    geekDescription: "Colecionáveis e cultura pop",
    nuveXBrazil: "NuveX Games · Brasil",
    nextLevel: "O próximo nível tem nome",
    nextPhase: "Sua próxima fase começa aqui.",
    heroDescription:
      "Um novo universo de games está sendo preparado para você. Descubra a NuveX Games e fique por dentro do que vem por aí.",
    meetNuvex: "Conheça a NuveX",
    explorePlatforms: "Explorar plataformas",
    madeForGamers: "Feita para quem joga",
    brazilFocus: "Brasil em foco",
    platformEyebrow: "Escolha seu universo",
    platformHeading: "Categorias para cada estilo.",
    platformDescription:
      "Do setup completo às coleções geek, explore as categorias NuveX e encontre o que combina com você.",
    platformEmptyBefore: "Estamos preparando novidades para quem curte",
    platformEmptyAfter: ".",
    trustStatement: "Identidade brasileira, atitude gamer",
    storePromise: "Uma loja pensada para quem joga",
    experienceInProgress: "Uma nova experiência em construção",
    catalog: "Catálogo NuveX",
    chooseAdventure: "Escolha sua próxima aventura.",
    catalogPreparing: "Estamos preparando o catálogo.",
    catalogDescription:
      "A vitrine NuveX Games está ganhando forma. Em breve, novos jogos e experiências para você explorar.",
    comingSoon: "Novidades em breve",
    footerDescription: "Novidades, lançamentos e universos para quem vive o jogo.",
    nextPhaseComing: "A próxima fase está chegando",
    contactHelp: "Precisa de ajuda ou quer falar com a NuveX? Estamos por aqui.",
    contactUs: "Entre em contato",
    paymentMethods: "Formas de pagamento",
    secureShopping: "Compre com segurança",
    certifications: "Certificados e avaliações",
    paymentNotice:
      "Formas de pagamento e certificações estão sujeitas à configuração e validação antes de serem oferecidas pela loja.",
    customerService: "Atendimento",
    information: "Informações",
    myAccount: "Minha conta",
    privacy: "Privacidade",
    terms: "Termos de uso",
    returns: "Política de devolução",
    shipping: "Entrega e frete",
    copyright: "Todos os direitos reservados.",
    madeForGamersFooter: "Feito para quem joga.",
    summary: "Resumo",
    goToCheckout: "Ir para o checkout",
    emptyCartMessage:
      "Sua sacola está vazia. Vamos mudar isso? Explore nossos produtos pelo link abaixo.",
    exploreProducts: "Explorar produtos",
    backToCart: "Voltar para a sacola",
    back: "Voltar",
    store: "Loja NuveX",
    shippingAddress: "Endereço de entrega",
    billingAddress: "Endereço de cobrança",
    continueDelivery: "Continuar para entrega",
    edit: "Editar",
    contactLabel: "Contato",
    sameBillingAddress: "O endereço de cobrança é o mesmo da entrega.",
    firstName: "Nome",
    lastName: "Sobrenome",
    address: "Endereço",
    company: "Empresa",
    postalCode: "CEP",
    city: "Cidade",
    email: "E-mail",
    phone: "Telefone",
    chooseAddress: "Escolha um endereço",
    inYourCart: "Na sua sacola",
    review: "Revisar pedido",
    continueReview: "Continuar para revisão",
    enterPaymentDetails: "Informe os dados de pagamento",
    placeOrderNotice:
      "Ao finalizar o pedido, você confirma que leu, entendeu e aceita nossos Termos de Uso, Termos de Venda e Política de Devolução, e reconhece que leu a Política de Privacidade da NuveX Games.",
    subtotalExclShippingTaxes: "Subtotal (sem frete e impostos)",
    subtotal: "Subtotal",
    shippingLabel: "Frete",
    discount: "Desconto",
    taxes: "Impostos",
    total: "Total",
    quantity: "Quantidade",
    remove: "Remover",
    goToCart: "Ver sacola",
    emptyBag: "Sua sacola está vazia.",
    goToProducts: "Ir para todos os produtos",
    item: "Produto",
    price: "Preço",
    alreadyAccount: "Já tem uma conta?",
    signInBetter: "Entre para ter uma experiência melhor.",
    signIn: "Entrar",
    shippingMethod: "Forma de entrega",
    delivery: "Entrega",
    deliveryInstruction: "Como você gostaria de receber seu pedido?",
    pickupOrder: "Retirar seu pedido",
    chooseNearbyStore: "Escolha uma loja perto de você",
    continuePayment: "Continuar para pagamento",
    method: "Método",
    payment: "Pagamento",
    paymentMethod: "Forma de pagamento",
    paymentDetails: "Dados de pagamento",
    anotherStep: "Uma etapa adicional será exibida",
    country: "País",
    giftCard: "Cartão-presente",
    enterTheGame: "Entre no jogo",
    yourWay: "Do seu jeito",
    getReady: "Prepare-se",
    nextPhaseArriving: "A próxima fase está chegando",
    companyBelongsTo: "NuveX Games pertence à TAURUS GAMES & ELETRÔNICOS",
    companyTaxId: "CNPJ: 69.951.204/0001-29",
    companyAddress: "Rua Gen. Osório, 590, Santa Ifigênia, São Paulo/SP · CEP: 01213-900",
    companyPhoneLabel: "Tel / WhatsApp",
    xpBoost: "+2.500 XP · PRO GAMER",
    playerLevel: "LVL 99",
    nextLevelTier: "Próximo Nível: Lendário",
    achievementUnlocked: "Conquista Desbloqueada",
    rareDrop: "Drop Raro NuveX",
    lowLatency: "100% Gamer · 0ms Lag",
  },
  "en-US": {
    announcement: "Deals, weekly drops & new releases · Curated updates for you",
    login: "Hello! Sign in",
    register: "or create an account",
    categories: "Categories",
    home: "Home",
    platforms: "Platforms",
    games: "Games",
    contact: "Contact us",
    search: "What are you looking for?",
    cart: "Cart",
    openCategories: "Open categories menu",
    closeCategories: "Close categories menu",
    explore: "Explore NuveX",
    menuTitle: "Find your next level",
    menuSubtitle: "Store categories",
    storeCategories: "More categories and news coming soon.",
    moreCategories: "Store categories",
    pcPeripherals: "PC & Peripherals",
    ps5: "PS5",
    xbox: "XBOX",
    switch: "Nintendo Switch",
    geek: "Geek",
    pcDescription: "Hardware, accessories & setups",
    ps5Description: "PlayStation 5",
    xboxDescription: "Xbox consoles & games",
    switchDescription: "Play at home or on the go",
    geekDescription: "Collectibles & pop culture",
    nuveXBrazil: "NuveX Games · United States",
    nextLevel: "The next level has a name",
    nextPhase: "Your next level starts here.",
    heroDescription:
      "A new gaming universe is being prepared for you. Discover NuveX Games and stay tuned for what's coming next.",
    meetNuvex: "Discover NuveX",
    explorePlatforms: "Explore platforms",
    madeForGamers: "Made for gamers",
    brazilFocus: "Built for the next level",
    platformEyebrow: "Choose your universe",
    platformHeading: "Categories for every style.",
    platformDescription:
      "From complete gaming setups to geek collectibles, explore NuveX categories and find what fits your style.",
    platformEmptyBefore: "We're getting new picks ready for",
    platformEmptyAfter: ".",
    trustStatement: "Brazilian roots, gamer attitude",
    storePromise: "A store made for gamers",
    experienceInProgress: "A new experience in the making",
    catalog: "NuveX catalog",
    chooseAdventure: "Choose your next adventure.",
    catalogPreparing: "Our catalog is getting ready.",
    catalogDescription:
      "The NuveX Games storefront is taking shape. New games and experiences are coming soon.",
    comingSoon: "Coming soon",
    footerDescription: "New releases and worlds for everyone who lives the game.",
    nextPhaseComing: "Your next level is coming",
    contactHelp: "Need help or want to talk to NuveX? We're here for you.",
    contactUs: "Contact us",
    paymentMethods: "Payment methods",
    secureShopping: "Secure shopping",
    certifications: "Certifications & reviews",
    paymentNotice:
      "Payment methods and certifications are subject to setup and validation before being offered by the store.",
    customerService: "Customer service",
    information: "Information",
    myAccount: "My account",
    privacy: "Privacy",
    terms: "Terms of use",
    returns: "Returns policy",
    shipping: "Shipping & delivery",
    copyright: "All rights reserved.",
    madeForGamersFooter: "Made for gamers.",
    summary: "Summary",
    goToCheckout: "Proceed to checkout",
    emptyCartMessage:
      "Your cart is empty. Let's change that—explore our products using the link below.",
    exploreProducts: "Explore products",
    backToCart: "Back to shopping cart",
    back: "Back",
    store: "NuveX Store",
    shippingAddress: "Shipping address",
    billingAddress: "Billing address",
    continueDelivery: "Continue to delivery",
    edit: "Edit",
    contactLabel: "Contact",
    sameBillingAddress: "Billing and delivery addresses are the same.",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    company: "Company",
    postalCode: "ZIP code",
    city: "City",
    email: "Email",
    phone: "Phone",
    chooseAddress: "Choose an address",
    inYourCart: "In your cart",
    review: "Review order",
    continueReview: "Continue to review",
    enterPaymentDetails: "Enter payment details",
    placeOrderNotice:
      "By placing your order, you confirm that you have read, understand and accept our Terms of Use, Terms of Sale and Returns Policy, and acknowledge that you have read NuveX Games' Privacy Policy.",
    subtotalExclShippingTaxes: "Subtotal (excl. shipping and taxes)",
    subtotal: "Subtotal",
    shippingLabel: "Shipping",
    discount: "Discount",
    taxes: "Taxes",
    total: "Total",
    quantity: "Quantity",
    remove: "Remove",
    goToCart: "View cart",
    emptyBag: "Your shopping bag is empty.",
    goToProducts: "Go to all products",
    item: "Item",
    price: "Price",
    alreadyAccount: "Already have an account?",
    signInBetter: "Sign in for a better experience.",
    signIn: "Sign in",
    shippingMethod: "Shipping method",
    delivery: "Delivery",
    deliveryInstruction: "How would you like your order delivered?",
    pickupOrder: "Pick up your order",
    chooseNearbyStore: "Choose a store near you",
    continuePayment: "Continue to payment",
    method: "Method",
    payment: "Payment",
    paymentMethod: "Payment method",
    paymentDetails: "Payment details",
    anotherStep: "Another step will appear",
    country: "Country",
    giftCard: "Gift card",
    enterTheGame: "Get in the game",
    yourWay: "Your way",
    getReady: "Get ready",
    nextPhaseArriving: "The next level is arriving",
    companyBelongsTo: "NuveX Games is operated by TAURUS GAMES & ELETRÔNICOS",
    companyTaxId: "Tax ID / CNPJ: 69.951.204/0001-29",
    companyAddress: "Rua Gen. Osório, 590, Santa Ifigênia, São Paulo/SP, Brazil · CEP: 01213-900",
    companyPhoneLabel: "Phone / WhatsApp",
    xpBoost: "+2,500 XP · PRO GAMER",
    playerLevel: "LVL 99",
    nextLevelTier: "Next Level: Legendary",
    achievementUnlocked: "Achievement Unlocked",
    rareDrop: "Rare NuveX Drop",
    lowLatency: "100% Gamer · 0ms Latency",
  },
}

export const getStoreLanguage = (countryCode?: string): StoreLanguage =>
  countryCode?.toLowerCase() === "us" ? "en-US" : "pt-BR"

export const translate = (
  countryCode: string | undefined,
  key: TranslationKey,
) => translations[getStoreLanguage(countryCode)][key]

export const getCategoryLabel = (
  countryCode: string | undefined,
  categoryId: string,
) => {
  const keys: Record<string, TranslationKey> = {
    "categoria-pc-perifericos": "pcPeripherals",
    "categoria-ps5": "ps5",
    "categoria-xbox": "xbox",
    "categoria-switch": "switch",
    "categoria-geek": "geek",
  }

  const key = keys[categoryId]
  return key ? translate(countryCode, key) : categoryId
}

export const getCategoryDescription = (
  countryCode: string | undefined,
  categoryId: string,
) => {
  const keys: Record<string, TranslationKey> = {
    "categoria-pc-perifericos": "pcDescription",
    "categoria-ps5": "ps5Description",
    "categoria-xbox": "xboxDescription",
    "categoria-switch": "switchDescription",
    "categoria-geek": "geekDescription",
  }

  const key = keys[categoryId]
  return key ? translate(countryCode, key) : ""
}
