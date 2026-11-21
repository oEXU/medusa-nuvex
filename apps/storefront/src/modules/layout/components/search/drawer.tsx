"use client"

import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import React, { Fragment } from "react"

type SearchDrawerProps = {
  isOpen: boolean
  close: () => void
  children: React.ReactNode
}

const SearchDrawer = ({ isOpen, close, children }: SearchDrawerProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ui-bg-overlay backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform-gpu origin-top-right transition ease-out duration-300 motion-reduce:transition-none"
              enterFrom="opacity-0 -translate-y-3 scale-y-95"
              enterTo="opacity-100 translate-y-0 scale-y-100"
              leave="transform-gpu origin-top-right transition ease-in duration-200 motion-reduce:transition-none"
              leaveFrom="opacity-100 translate-y-0 scale-y-100"
              leaveTo="opacity-0 -translate-y-2 scale-y-95"
            >
              <Dialog.Panel
                className="pointer-events-auto w-screen max-w-md origin-top-right motion-reduce:transform-none"
                data-testid="search-drawer"
              >
                <div className="flex h-full flex-col border-l border-ui-border-base bg-ui-bg-base shadow-elevation-modal">
                  <div className="flex items-center justify-between border-b border-ui-border-base px-4 py-3">
                    <Dialog.Title className="text-large-semi text-ui-fg-base">
                      Search
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close search"
                      className="text-ui-fg-muted hover:text-ui-fg-base"
                      data-testid="close-search-drawer"
                    >
                      <XMark />
                    </button>
                  </div>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SearchDrawer
