import axios from 'axios';

export async function POST(req) {
export async function POST(req: { json: () => PromiseLike<{ cryptoAmount: number; cryptoSymbol: string; fiatSymbol: string; }> | { cryptoAmount: number; cryptoSymbol: string; fiatSymbol: string; }; }) {
    try {
        const { cryptoAmount, cryptoSymbol, fiatSymbol } = await req.json();

        if (!cryptoAmount || !cryptoSymbol || !fiatSymbol) {
            return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400 });
        }

        console.log('Received values:', { cryptoAmount, cryptoSymbol, fiatSymbol });

        const response = await axios.get('https://pro-api.coinmarketcap.com/v2/tools/price-conversion', {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY,
                'Accept': 'application/json',
            },
            params: {
                amount: cryptoAmount,
                symbol: cryptoSymbol,
                convert: fiatSymbol,
            },
        });

        console.log('CoinMarketCap API response:', response.data);

        const { data } = response;

        if (data.status.error_code === 0) {
            const cryptoData = data.data.find(item => item.symbol === cryptoSymbol);
            const cryptoData = data.data.find((item: { symbol: string; }) => item.symbol === cryptoSymbol);
            if (cryptoData && cryptoData.quote && cryptoData.quote[fiatSymbol]) {
                const convertedAmount = cryptoData.quote[fiatSymbol].price;
                return new Response(
                    JSON.stringify({ convertedAmount, fiatSymbol }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                return new Response(JSON.stringify({ error: `Unable to find quote for ${cryptoSymbol} to ${fiatSymbol}` }), { status: 500 });
            }
        } else {
            return new Response(JSON.stringify({ error: 'API error: Unable to fetch conversion rate.' }), { status: 500 });
        }
    } catch (error) {
        console.error('Error in API route:', error); 
        return new Response(JSON.stringify({ error: `Server error: Unable to process the request. ${error.message}` }), { status: 500 });
    }
}
