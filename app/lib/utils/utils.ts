export enum ConversionType {
    Price, // Conversion based on price, cached to redis
    MarketCap, // Conversion based on market cap, cached to redis
    Any, // Default conversion type, NOT cached
}

const updatePriceConversion = async (certificate: string, convertedPrice: number, conversionType: ConversionType) => {
    try {
        const response = await fetch(`/api/convert-crypto/update-price-conversion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                certificate,
                convertedPrice,
                conversionType,
            }),
        });

        if (response.ok) {
            
        } else {
            throw new Error('Did not update');
        }

    } catch (error) {    
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error');
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

const fetchPriceConversion = async (
    cryptoAmount: number,
    cryptoSymbol: string,
    fiatSymbol: string,
    certificate: string,
    conversionType: ConversionType) => {
    
    try {
        const response = await fetch(`/api/convert-crypto/fetch-price-conversion/${certificate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversionType,
            }),
        });

        const fetchedData = await response.json();

        if (fetchedData.needsUpdating) {
            const conversion = await fetchCryptoConversionFromCoinMarketCap(cryptoAmount, cryptoSymbol, fiatSymbol);

            await updatePriceConversion(certificate, conversion, conversionType);
            return conversion;
        } else {
            return fetchedData.data.conversion;
        }

    } catch (error) {    
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error');
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

const fetchCryptoConversionFromCoinMarketCap = async (cryptoAmount: number, cryptoSymbol: string, fiatSymbol: string) => {
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
}

export const convertCryptoToFiat = async (
    cryptoAmount: number,
    cryptoSymbol: string,
    fiatSymbol: string,
    certificate: string,
    conversionType: ConversionType = ConversionType.Any
) => {
    console.log('Converting', cryptoAmount, cryptoSymbol, 'to', fiatSymbol);
    console.log('Conversion type:', conversionType);
    console.log('Certificate:', certificate);

    const cacheKey = `conversion_${certificate}_${conversionType}`;
    const cachedResult = sessionStorage.getItem(cacheKey);

    if (cachedResult) {
        return JSON.parse(cachedResult);
    }

    let conversion;
    if (conversionType != ConversionType.Any) {
        conversion = await fetchPriceConversion(cryptoAmount, cryptoSymbol, fiatSymbol, certificate, conversionType);
    } else {
        console.log('Custom conversion. Directly fetching from CMC');
        conversion = await fetchCryptoConversionFromCoinMarketCap(cryptoAmount, cryptoSymbol, fiatSymbol);
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(conversion));

    return conversion;
};

export const checkImage = async (url: string) => {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch {
        return false;
    }
};

export const updateImageSrc = async (image: string | undefined, blockiesIcon: HTMLCanvasElement, setImgSrc: (src: string) => void, setIsLoading: (loading: boolean) => void) => {
    const option1 = `https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`;
    const option2 = `https://aquamarine-used-bear-228.mypinata.cloud/ipfs/${image}`;
    const cacheKey = `imageSrc_${image}`;

    setIsLoading(true);

    const cachedSrc = localStorage.getItem(cacheKey);
    if (cachedSrc) {
        setImgSrc(cachedSrc);
        setIsLoading(false);
        return;
    }

    let imgSrc;
    if (image && image.startsWith('https')) {
        imgSrc = blockiesIcon.toDataURL();
    } else if (await checkImage(option1)) {
        imgSrc = option1;
    } else if (await checkImage(option2)) {
        imgSrc = option2;
    } else {
        imgSrc = blockiesIcon.toDataURL();
    }

    localStorage.setItem(cacheKey, imgSrc);
    setImgSrc(imgSrc);
    setIsLoading(false);
};
