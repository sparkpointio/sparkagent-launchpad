import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const forumToken = searchParams.get("forumToken");

        if (!forumToken) {
            return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400 });
        }

        const apiUrl = `https://sparkagent-api.aldrickb.xyz/fetchForumMessagesCount/${forumToken}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_FORUM_API,
                'Accept': 'application/json',
            },
        });

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching forum messages:', error);
        return new Response(
            JSON.stringify({ error: `Server error: Unable to process the request. ${error instanceof Error ? error.message : 'Unknown error'}` }),
            { status: 500 }
        );
    }
}