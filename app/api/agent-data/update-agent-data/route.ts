import { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const requestBody = await req.json();
        const contractAddress = searchParams.get("contractAddress");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        if (!contractAddress) {
            return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400 });
        }

        const apiUrl = `${backendUrl}/updateAgentData`;

        const response = await axios.post(apiUrl, {
            personality: requestBody.personality,
            first_message: requestBody.first_message,
            lore: requestBody.lore,
            style: requestBody.style,
            adjective: requestBody.adjective,
            knowledge: requestBody.knowledge,
        }, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_FORUM_API,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error updating agent data:', error);
        return new Response(
            JSON.stringify({ error: `Server error: Unable to process the request. ${error instanceof Error ? error.message : 'Unknown error'}` }),
            { status: 500 }
        );
    }
}