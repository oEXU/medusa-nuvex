"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import {
  getCategoryDescription,
  getCategoryLabel,
  translate,
} from "@lib/util/store-locale"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import { storeCategories, StoreCategoryIcon } from "../store-categories"

type SideMenuProps = {
  countryCode: string
}

const SideMenu = ({ countryCode }: SideMenuProps) => {
  return (
    <div className="flex h-full items-center">
      <Popover className="relative flex h-full">
        {({ open, close }) => (
          <>
            <PopoverButton
              data-testid="nav-menu-button"
              aria-label={
                translate(
                  countryCode,
                  open ? "closeCategories" : "openCategories",
                )
              }
              className={clx(
                "flex h-full items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-wide text-white transition hover:text-pink-200 focus:outline-none",
                open ? "text-pink-200" : "",
              )}
            >
              {open ? <XMark /> : <MenuIcon />}
              <span className="hidden xsmall:inline">
                {translate(countryCode, "categories")}
              </span>
            </PopoverButton>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-2"
            >
              <PopoverPanel
                anchor="bottom start"
                className="z-[60] mt-3 w-[min(92vw,760px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_24px_70px_rgba(2,8,23,0.28)]"
              >
                <div data-testid="nav-menu-popup">
                  <div className="flex items-end justify-between bg-[#21102f] px-5 py-5 text-white small:px-7">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-200">
                        {translate(countryCode, "explore")}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight small:text-2xl">
                        {translate(countryCode, "menuTitle")}
                      </h2>
                    </div>
                    <span className="hidden text-xs text-white/55 small:block">
                      {translate(countryCode, "menuSubtitle")}
                    </span>
                  </div>
                  <ul className="grid gap-2 p-3 xsmall:grid-cols-2 small:grid-cols-3 small:gap-3 small:p-5">
                    {storeCategories.map((category, index) => (
                      <li key={category.id}>
                        <LocalizedClientLink
                          href={`/#${category.id}`}
                          onClick={close}
                          data-testid={`${category.id}-menu-link`}
                          className="group flex h-full min-h-[92px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-fuchsia-500/50 hover:bg-slate-50 hover:shadow-md small:min-h-[108px] small:flex-col small:items-start small:justify-between small:p-4"
                        >
                          <span
                            className={clx(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition group-hover:scale-105",
                              index % 2 === 0
                                ? "bg-gradient-to-br from-[#51205f] to-[#17102f]"
                                : "bg-gradient-to-br from-slate-700 to-slate-950",
                            )}
                          >
                            <StoreCategoryIcon
                              name={category.icon}
                              className={
                                category.icon === "switch"
                                  ? "h-5 w-10"
                                  : "h-7 w-8"
                              }
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-900">
                              {getCategoryLabel(countryCode, category.id)}
                            </span>
                            <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                              {getCategoryDescription(countryCode, category.id)}
                            </span>
                          </span>
                          <ArrowRightMini className="ml-auto hidden shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-fuchsia-700 small:block" />
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm xsmall:flex-row xsmall:items-center xsmall:justify-between">
                    <p className="font-medium text-slate-600">
                      {translate(countryCode, "storeCategories")}
                    </p>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default SideMenu
