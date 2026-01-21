export const validateSubscriptionData = (data: any) => {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Subscription name is required"
  } else if (data.name.length > 100) {
    errors.name = "Subscription name must be less than 100 characters"
  }

  // Price validation
  const price = Number.parseFloat(data.price)
  if (isNaN(price) || price <= 0) {
    errors.price = "Price must be greater than $0"
  } else if (price > 10000) {
    errors.price = "Price must be less than $10,000"
  }

  // Date validation (renewal date)
  if (data.renewsIn !== undefined && data.renewsIn !== null) {
    const renewsIn = Number.parseInt(data.renewsIn)
    if (isNaN(renewsIn) || renewsIn < 0) {
      errors.renewsIn = "Days until renewal must be 0 or greater"
    } else if (renewsIn > 365) {
      errors.renewsIn = "Days until renewal must be less than 365"
    }
  }

  // Email validation
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.email = "Invalid email format"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateAPIKey = (provider: string, apiKey: string) => {
  const errors: string[] = []

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push("API key is required")
    return { isValid: false, errors }
  }

  // Provider-specific validation
  switch (provider.toLowerCase()) {
    case "openai":
    case "chatgpt":
      if (!apiKey.startsWith("sk-")) {
        errors.push("OpenAI API keys must start with 'sk-'")
      }
      if (apiKey.length < 20) {
        errors.push("OpenAI API key appears to be too short")
      }
      break
    case "anthropic":
    case "claude":
      if (!apiKey.startsWith("sk-ant-")) {
        errors.push("Anthropic API keys must start with 'sk-ant-'")
      }
      break
    case "google":
    case "gemini":
      if (apiKey.length < 30) {
        errors.push("Google API key appears to be too short")
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const maskAPIKey = (apiKey: string) => {
  if (!apiKey || apiKey.length < 8) return "••••••••"
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
}
