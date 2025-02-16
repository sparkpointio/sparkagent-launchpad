import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
    request: NextRequest,
    { params }: { params: { address: string } } // Corrected type
): Promise<NextResponse> {
    try {
        const { address } = params;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        if (!backendUrl) {
            return NextResponse.json({ error: 'Backend API URL is not set' }, { status: 500 });
        }

        const response = await axios.get(`${backendUrl}/fetchAgentToken/${address}`);
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
}
