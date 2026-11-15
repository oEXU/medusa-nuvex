import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import { translate } from "@lib/util/store-locale"

const EmptyCartMessage = ({ countryCode }: { countryCode: string }) => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {translate(countryCode, "cart")}
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        {translate(countryCode, "emptyCartMessage")}
      </Text>
      <div>
        <InteractiveLink href="/store">
          {translate(countryCode, "exploreProducts")}
        </InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
