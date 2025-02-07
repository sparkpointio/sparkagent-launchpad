const oneDayInMilliseconds = 1000;

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
    console.log('Converting', cryptoAmount, cryptoSymbol, 'to', fiatSymbol);
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

export const checkImage = async (url: string) => {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch {
        return false;
    }
};

export const updateImageSrc = async (image: string, blockiesIcon: HTMLCanvasElement, setImgSrc: (src: string) => void, setIsLoading: (loading: boolean) => void) => {
    const option1 = `https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`;
    const option2 = `https://aquamarine-used-bear-228.mypinata.cloud/ipfs/${image}`;

    setIsLoading(true);

    if (image.startsWith('https')) {
        setImgSrc(blockiesIcon.toDataURL());
        console.log("Blockies has been used: " + blockiesIcon.toDataURL());
    } else if (await checkImage(option1)) {
        setImgSrc(option1);
        console.log("Option 1 has been used: " + option1);
    } else if (await checkImage(option2)) {
        setImgSrc(option2);
        console.log("Option 2 has been used: " + option2);
    } else {
        setImgSrc(blockiesIcon.toDataURL());
        console.log("Blockies has been used: " + blockiesIcon.toDataURL());
    }

    setIsLoading(false);
};
