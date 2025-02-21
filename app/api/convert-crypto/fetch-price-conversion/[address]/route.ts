import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ConversionType } from '@/app/lib/utils/utils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse> {
    try {
        const address = (await params).address;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiKey = process.env.NEXT_PUBLIC_FORUM_API;
        const { conversionType }: { conversionType: ConversionType } = await request.json();
        const endpoint = conversionType === ConversionType.Price ? 'fetchTokenPriceConversion' : 'fetchTokenMarketCapConversion';

        if (!backendUrl) {
            return NextResponse.json({ error: 'Backend API URL is not set' }, { status: 500 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is not set' }, { status: 500 });
        }

        const response = await axios.get(`http://${backendUrl}/${endpoint}/${address}`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Error fetching token price conversion:', error);
        return NextResponse.json({ error: 'Failed to fetch conversion' }, { status: 500 });
    }
}
