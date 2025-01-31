export const convertCryptoToFiat = async (
    cryptoAmount: number, // Explicitly type as number
    cryptoSymbol: string, // Explicitly type as string
    fiatSymbol: string // Explicitly type as string
) => {
    try {
        const response = await fetch('/api/convert-crypto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cryptoAmount,
                cryptoSymbol,
                fiatSymbol,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return data.convertedAmount;
        } else {
            throw new Error(data.error || 'Conversion failed');
        }
    } catch (error) {
        // Safely handle the error (TypeScript treats 'error' as 'unknown')
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error');
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
