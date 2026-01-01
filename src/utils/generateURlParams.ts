export const generateUrlParams = <T extends Record<string, any>>(payload: T): string => {
  const params = new URLSearchParams()

  const addParam = (key: string, value: any) => {
    if (value === undefined || value === null || value === '') return

    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        addParam(`${key}${nestedKey}`, nestedValue)
      })
    } else {
      params.append(key, String(value))
    }
  }

  for (const key in payload) {
    const value = payload[key as keyof T]
    addParam(key, value)
  }

  return params.toString()
}
