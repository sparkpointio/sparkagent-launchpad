const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

const getCache = (key: string) => {
    const cached = localStorage.getItem(key);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < oneDayInMilliseconds) {
            return parsed.amount;
        }
    }
    return null;
};

const setCache = (key: string, amount: number) => {
    const cacheEntry = {
        amount,
        timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
};

export const convertCryptoToFiat = async (
    cryptoAmount: number,
    cryptoSymbol: string,
    fiatSymbol: string,
    certificate: string
) => {
    const cacheKey = `${certificate}-${cryptoSymbol}-${fiatSymbol}`;

    // Caching here
    const cachedAmount = getCache(cacheKey);
    if (cachedAmount !== null) {
        return cachedAmount;
    }

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
            const convertedAmount = data.convertedAmount;
            // Store the result in the cache with the current timestamp
            setCache(cacheKey, convertedAmount);
            return convertedAmount;
        } else {
            throw new Error(data.error || 'Conversion failed');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error');
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
