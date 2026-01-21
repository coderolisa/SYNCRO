export const sanitizeCSVCell = (value: any): string => {
  if (value === null || value === undefined) return ""

  const stringValue = String(value)

  // Prevent CSV injection by escaping cells that start with special characters
  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"]
  if (dangerousChars.some((char) => stringValue.startsWith(char))) {
    return `'${stringValue}`
  }

  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export const generateSafeCSV = (headers: string[], rows: any[][]) => {
  const sanitizedHeaders = headers.map(sanitizeCSVCell)
  const sanitizedRows = rows.map((row) => row.map(sanitizeCSVCell))

  return [sanitizedHeaders.join(","), ...sanitizedRows.map((row) => row.join(","))].join("\n")
}

export const downloadCSV = (content: string, filename: string) => {
  // Ensure filename is safe and unique
  const safeFilename = filename.replace(/[^a-z0-9_-]/gi, "_")
  const timestamp = new Date().toISOString().split("T")[0]
  const uniqueFilename = `${safeFilename}-${timestamp}.csv`

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = uniqueFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
