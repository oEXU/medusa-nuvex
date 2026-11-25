import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import BlackcatPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [BlackcatPaymentProviderService],
})
