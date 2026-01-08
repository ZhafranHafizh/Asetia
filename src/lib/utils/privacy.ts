/**
 * Masks a name for privacy protection
 * Keeps first and last character, replaces middle with asterisks
 * 
 * @param name - The full name to mask
 * @returns Masked name (e.g., "John Doe" -> "J***e")
 * 
 * @example
 * maskName("John Doe") // "J***e"
 * maskName("Budi") // "B**i"
 * maskName("Al") // "A*"
 * maskName("A") // "A*"
 */
export function maskName(name: string | null | undefined): string {
    if (!name || name.trim().length === 0) {
        return 'Unknown'
    }

    const trimmedName = name.trim()

    // If name is 1 character, return first char + *
    if (trimmedName.length === 1) {
        return trimmedName[0] + '*'
    }

    // If name is 2 characters, return first char + * + last char
    if (trimmedName.length === 2) {
        return trimmedName[0] + '*'
    }

    // For names 3+ characters
    const firstChar = trimmedName[0]
    const lastChar = trimmedName[trimmedName.length - 1]

    // Calculate number of asterisks based on name length
    // Minimum 2, maximum 5 asterisks
    const nameLength = trimmedName.length
    let asteriskCount: number

    if (nameLength <= 4) {
        asteriskCount = 2
    } else if (nameLength <= 7) {
        asteriskCount = 3
    } else if (nameLength <= 10) {
        asteriskCount = 4
    } else {
        asteriskCount = 5
    }

    const asterisks = '*'.repeat(asteriskCount)

    return `${firstChar}${asterisks}${lastChar}`
}
