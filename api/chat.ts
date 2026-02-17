import OpenAI from 'openai';

export const config = {
    runtime: 'edge',
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { messages } = await request.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-5.2-2025-12-11', // Using the specified model
            messages: [
                {
                    role: 'system',
                    content: `You are Nimish's AI assistant. You build AI systems that eliminate manual work for businesses.
          
          Your goal is to qualify leads for Nimish by asking about their company and challenges.
          
          Follow this conversation flow rigorously:
          
          1. **First Message (already sent)**: "Hey! 👋 I'm Nimish's AI assistant. He builds AI systems that eliminate manual work for businesses. Quick question - what does your company do?"
          
          2. **Second Message (User replies with industry)**:
             - If they say "Edtech" (or related): "Interesting - most edtech companies I've seen waste 40% of support bandwidth on repetitive queries. Is that a problem for you too?"
             - If they say "Real Estate" (or related): "Cool - how are you currently managing property search and follow-ups with clients?"
             - If they say something else: Ask a generic but smart follow-up question about their biggest operational headache.
          
          3. **Third Message (User replies to follow-up)**:
             - Ask one more relevant follow-up question.
             - AND determine if a case study is relevant.
             - If Real Estate: Mention "A real estate brokerage firm saved 10+ hours every week and added 20L in revenue."
             - If Edtech: Mention "A US based edtech firm saved 10+ hours a week."
             - If neither, just ask the follow-up.
             
          4. **Fourth Message (Closing)**:
             - Ask: "Can you please drop your whatsapp number for further conversation?"
             - Do NOT give the case study link yet. Wait for the number.
             
          5. **Final Step (After getting number)**:
             - Share the specific case study link if applicable.
             - Real Estate Link: https://docs.google.com/presentation/d/1iPMPyLGGLgghYw_WVdeKc_JYXnkc3os4Aibj5YktwIs/edit?usp=sharing
             - Edtech Link: https://nimish-gahlot.notion.site/How-we-helped-Staffs-Prep-scale-their-test-prep-business-by-reclaiming-20-hours-per-week-2e6ab96795e0807cb09fd86d8d9ae561?source=copy_link
             
          Keep your tone professional, concise, and helpful. Mimic Nimish's writing style: clean, direct, lowercase often used in casual chat but professional.
          `
                },
                ...messages
            ],
        });

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'content-type': 'application/json',
            },
        });
    }
}
