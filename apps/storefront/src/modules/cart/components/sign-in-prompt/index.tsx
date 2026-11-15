"use client"

import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { translate } from "@lib/util/store-locale"

const SignInPrompt = () => {
  const { countryCode } = useParams<{ countryCode: string }>()
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {translate(countryCode, "alreadyAccount")}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {translate(countryCode, "signInBetter")}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            {translate(countryCode, "signIn")}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
