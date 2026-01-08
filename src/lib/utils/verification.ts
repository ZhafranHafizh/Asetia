/**
 * Generate a unique verification code in format: Word-Word-Number
 * Example: Aset-Lokal-45, Karya-Mantap-77
 */
export function generateVerificationCode(): string {
    const words1 = ['Aset', 'Karya', 'Kreasi', 'Desain', 'Produk', 'Toko', 'Jual', 'Beli']
    const words2 = ['Lokal', 'Mantap', 'Keren', 'Bagus', 'Hebat', 'Jaya', 'Sukses', 'Maju']

    const word1 = words1[Math.floor(Math.random() * words1.length)]
    const word2 = words2[Math.floor(Math.random() * words2.length)]
    const number = Math.floor(Math.random() * 90) + 10 // 10-99

    return `${word1}-${word2}-${number}`
}

/**
 * Get expiration time (10 minutes from now)
 */
export function getCodeExpiration(): Date {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    return now
}
