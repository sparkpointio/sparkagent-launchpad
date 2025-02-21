import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ConversionType } from '@/app/lib/utils/utils';

export async function POST(
    request: NextRequest,
): Promise<NextResponse> {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiKey = process.env.NEXT_PUBLIC_POST_FORUM_API;
        const { certificate, convertedPrice, conversionType }: { certificate: string; convertedPrice: number; conversionType: ConversionType } = await request.json();
        const endpoint = conversionType === ConversionType.Price ? 'updateTokenPriceConversion' : 'updateTokenMarketCapConversion';

        const address = certificate;
        const conversion = convertedPrice;

        if (!backendUrl) {
            return NextResponse.json({ error: 'Backend API URL is not set' }, { status: 500 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is not set' }, { status: 500 });
        }

        console.log(`Request Payload:  ${certificate}, ${convertedPrice}, ${conversionType}`);

        const response = await axios.post(`http://${backendUrl}/${endpoint}/`, {
            address,
            conversion,
        }, {
            headers: {
                'x-api-key': apiKey,
            }
        });

        console.log('Backend Response:', response.data);

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Error updating token price conversion:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Backend Response Error:', error.response.data);
        }
        return NextResponse.json({ error: 'Failed to update conversion' }, { status: 500 });
    }
}