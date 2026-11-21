import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Button, Container, Heading } from "@medusajs/ui"
import Medusa from "@medusajs/js-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})

type SupportTicket = {
  id: string
  name: string
  whatsapp: string
  question: string
  created_at: string
}

const SupportTicketsPage = () => {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState("")
  const { data, isLoading, error } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () =>
      sdk.client.fetch<{
        support_tickets: SupportTicket[]
        count: number
      }>("/admin/support-tickets"),
  })

  const deleteTicket = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/support-tickets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setActionError("")
      void queryClient.invalidateQueries({ queryKey: ["support-tickets"] })
    },
    onError: (mutationError) => setActionError(mutationError.message),
  })

  const tickets = data?.support_tickets ?? []

  return (
    <Container className="flex flex-col gap-6 py-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
          NuveX Games
        </p>
        <Heading level="h1">Tickets de suporte</Heading>
        <p className="mt-2 max-w-2xl text-sm text-ui-fg-subtle">
          Dúvidas enviadas pelos clientes para retorno pelo WhatsApp.
        </p>
      </div>

      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4">
        <p className="text-sm text-ui-fg-subtle">Tickets recebidos</p>
        <p className="mt-1 text-2xl font-semibold">{data?.count ?? 0}</p>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-ui-fg-error">
          Não foi possível apagar o ticket: {actionError}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-ui-fg-subtle">Carregando tickets...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-ui-fg-error">
          Não foi possível carregar os tickets: {error.message}
        </p>
      ) : tickets.length === 0 ? (
        <Container className="py-10 text-center">
          <Heading level="h2">Nenhum ticket recebido</Heading>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Quando um cliente enviar uma dúvida, ela aparecerá aqui.
          </p>
        </Container>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => {
            const digits = ticket.whatsapp.replace(/\D/g, "")
            const whatsappNumber =
              ticket.whatsapp.trim().startsWith("+") || digits.startsWith("55")
                ? digits
                : `55${digits}`
            const whatsappUrl = `https://wa.me/${whatsappNumber}`

            return (
              <Container
                key={ticket.id}
                className="flex flex-col gap-4 small:flex-row small:items-start small:justify-between"
              >
                <div className="min-w-0">
                  <Heading level="h2">{ticket.name}</Heading>
                  <p className="mt-1 text-xs text-ui-fg-muted">
                    Recebido em{" "}
                    {new Date(ticket.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm">
                    {ticket.question}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 small:shrink-0">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-ui-border-base px-3 py-2 text-sm font-medium text-ui-fg-interactive transition hover:bg-ui-bg-subtle"
                  >
                    Chamar no WhatsApp
                  </a>
                  <Button
                    size="small"
                    variant="danger"
                    isLoading={deleteTicket.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Confirma que o ticket de ${ticket.name} já foi respondido? Ele será apagado da lista.`
                      )

                      if (confirmed) {
                        setActionError("")
                        deleteTicket.mutate(ticket.id)
                      }
                    }}
                  >
                    Apagar ticket respondido
                  </Button>
                </div>
              </Container>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Tickets de suporte",
  icon: ChatBubbleLeftRight,
})

export default SupportTicketsPage
