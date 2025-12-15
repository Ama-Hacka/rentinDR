import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())
}

export function digitsOnly(input: string) {
  return (input || '').replace(/[^\d]/g, '')
}
