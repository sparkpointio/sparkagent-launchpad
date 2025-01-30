import { NextRequest } from 'next/server';
import axios, { AxiosError } from 'axios';

// Handle rate-limiting
async function retryRequest(
    retries: number,
    delay: number,
    cryptoAmount: number,
    cryptoSymbol: string,
    fiatSymbol: string
): Promise<any> { // Consider defining a proper return type
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.get('https://pro-api.coinmarketcap.com/v2/tools/price-conversion', {
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY!,
                    'Accept': 'application/json',
                },
                params: { amount: cryptoAmount, symbol: cryptoSymbol, convert: fiatSymbol },
            });

            return response;
        } catch (error: unknown) { 
            if (error instanceof AxiosError && error.response?.status === 429) {
                console.log(`Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }

    throw new Error('Failed after multiple retries.');
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const { cryptoAmount, cryptoSymbol, fiatSymbol }: { cryptoAmount: number; cryptoSymbol: string; fiatSymbol: string } = await req.json();

        if (!cryptoAmount || !cryptoSymbol || !fiatSymbol) {
            return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400 });
        }

        console.log('Received values:', { cryptoAmount, cryptoSymbol, fiatSymbol });

        const retries = 3;
        const delay = 5000;

        // Retry logic for CoinMarketCap API request
        const response = await retryRequest(retries, delay, cryptoAmount, cryptoSymbol, fiatSymbol);
        console.log('CoinMarketCap API response:', response.data);

        const { data } = response;
        if (data.status.error_code === 0) {
            const cryptoData = data.data.find((item: { symbol: string }) => item.symbol === cryptoSymbol);
            if (cryptoData?.quote?.[fiatSymbol]) {
                const convertedAmount = cryptoData.quote[fiatSymbol].price;
                return new Response(JSON.stringify({ convertedAmount, fiatSymbol }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            } else {
                return new Response(JSON.stringify({ error: `Unable to find quote for ${cryptoSymbol} to ${fiatSymbol}` }), { status: 500 });
            }
        } else {
            return new Response(JSON.stringify({ error: 'API error: Unable to fetch conversion rate.' }), { status: 500 });
        }
    } catch (error: unknown) { 
        console.error('Error in API route:', error);

        // Check if error has a `message` property
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: `Server error: ${errorMessage}` }), { status: 500 });
    }
}
