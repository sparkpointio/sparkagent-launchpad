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
            signature: requestBody.signature,
            bio: requestBody.bio,
            address: contractAddress,
            personality: requestBody.bio,
            first_message: requestBody.firstMessage,
            lore: requestBody.lore,
            style: requestBody.style,
            adjective: requestBody.adjective,
            knowledge: requestBody.knowledge,
            topics: requestBody.topics,
        }, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_POST_FORUM_API,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Backend API Error Response:", error.response.data);
            console.error("Backend API Error Status:", error.response.status);
        } else {
            console.error("Error updating agent data:", error);
        }
        return new Response(
            JSON.stringify({ error: `Server error: Unable to process the request. ${error instanceof Error ? error.message : 'Unknown error'}` }),
            { status: 500 }
        );
    }
}