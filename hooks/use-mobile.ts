import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getClientMobileSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerMobileSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobile,
    getClientMobileSnapshot,
    getServerMobileSnapshot
  )
}
