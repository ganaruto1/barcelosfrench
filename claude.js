const MAX_TOKENS_LIMIT = 2000;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método não permitido." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return response.status(503).json({
      error: "A IA ainda não foi configurada. Adicione ANTHROPIC_API_KEY na Vercel.",
    });
  }

  const body = typeof request.body === "string"
    ? JSON.parse(request.body || "{}")
    : (request.body || {});
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const requestedTokens = Number(body.maxTokens) || 1000;
  const maxTokens = Math.min(MAX_TOKENS_LIMIT, Math.max(100, requestedTokens));

  if (!prompt || prompt.length > 20000) {
    return response.status(400).json({ error: "Prompt inválido." });
  }

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      const message = data?.error?.message || "Falha ao consultar a IA.";
      return response.status(anthropicResponse.status).json({ error: message });
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return response.status(200).json({ text });
  } catch (error) {
    return response.status(500).json({ error: "Não foi possível conectar à IA." });
  }
}
