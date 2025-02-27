import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse> {
    try {
        const address = ((await params).address).toLowerCase()
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        if (!backendUrl) {
            return NextResponse.json({ error: 'Backend API URL is not set' }, { status: 500 });
        }

        const body = await request.json();

        // Ensure the request body includes the correct address
        const payload = { ...body, address };

        console.log("payload");
        console.log(payload);

        const response = await axios.post(`${backendUrl}/updateAgentData`, payload, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_POST_FORUM_API,
                'Accept': 'application/json',
            },
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Error updating agent data:', error);
        return NextResponse.json({ error: 'Failed to update agent data' }, { status: 500 });
    }
}
