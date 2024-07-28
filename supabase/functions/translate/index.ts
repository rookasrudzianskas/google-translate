import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import OpenAI from 'npm:openai';
import {corsHeaders} from "~/supabase/_shared/cors";

const openai = new OpenAI();

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { input, from, to } = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a translator. You translate from ${from} to ${to}. You output only the translated text`,
      },
      { role: 'user', content: input },
    ],
    model: 'gpt-4o',
  });

  console.log(completion.choices[0]);

  return new Response(JSON.stringify(completion.choices[0].message), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/translate' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
