import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            return new Response(JSON.stringify({ error: 'Backend API URL is not set' }), { status: 500 });
        }

        const response = await axios.get(`${backendUrl}/fetchAgentTokens`);
        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch tokens' }), { status: 500 });
    }
}
