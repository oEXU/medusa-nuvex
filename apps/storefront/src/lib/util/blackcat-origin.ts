type BlackcatOriginWindow = Window & {
  BlackCatOrigem?: {
    token: () => Promise<unknown> | unknown
  }
  __blackcatOriginScriptState?: "ready" | "error"
}

export async function getBlackcatOriginToken(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("O token de origem da BlackCat só pode ser obtido no checkout.")
  }

  const originWindow = window as BlackcatOriginWindow
  const deadline = Date.now() + 15000

  while (typeof originWindow.BlackCatOrigem?.token !== "function") {
    if (originWindow.__blackcatOriginScriptState === "error") {
      throw new Error("Não foi possível carregar a validação de origem da BlackCat.")
    }
    if (Date.now() >= deadline) {
      throw new Error("A validação de origem da BlackCat não ficou disponível a tempo.")
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  const token = await originWindow.BlackCatOrigem.token()
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new Error("A BlackCat não retornou um token de origem válido.")
  }

  return token
}
