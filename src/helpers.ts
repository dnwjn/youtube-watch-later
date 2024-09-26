export const logLine = (message: string, ...optionalParams: any[]) => {
  console.log(`[YT Watch Later] ${message}`, ...optionalParams)
}

export const logError = (message: string, ...optionalParams: any[]) => {
  console.error(`[YT Watch Later] ${message}`, ...optionalParams)
}
