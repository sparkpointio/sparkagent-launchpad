export const convertCryptoToFiat = async (cryptoAmount, cryptoSymbol, fiatSymbol) => {
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
        throw new Error(error.message || 'Server error');
    }
};
