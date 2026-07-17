# French Master — versão pronta para Vercel

## Publicar sem usar terminal (GitHub + Vercel)

1. Extraia o ZIP no computador.
2. Entre em https://github.com/new e crie um repositório chamado `french-master`.
3. Dentro do repositório, escolha **Add file → Upload files**.
4. Envie o conteúdo que está dentro da pasta `FrenchMaster-Vercel` (incluindo `src`, `api`, `index.html` e `package.json`) e confirme em **Commit changes**.
5. Entre em https://vercel.com/new, conecte o GitHub e importe `french-master`.
6. A Vercel reconhecerá o projeto como **Vite**. Não altere os comandos e clique em **Deploy**.

O site já funcionará com os exercícios internos. Para ativar geração de histórias, curiosidades, correção por IA e novas palavras, siga a seção abaixo.

## Ativar a IA com segurança

1. Obtenha uma chave de API da Anthropic. A assinatura comum do Claude e os créditos da API são cobranças separadas.
2. Na Vercel, abra o projeto e acesse **Settings → Environment Variables**.
3. Crie `ANTHROPIC_API_KEY` e cole a chave como valor. Marque Production, Preview e Development.
4. Opcionalmente, crie `ANTHROPIC_MODEL` com o identificador de um modelo disponível na sua conta. O padrão do projeto é `claude-sonnet-4-6`.
5. Abra **Deployments**, clique nos três pontos do último deploy e escolha **Redeploy**.

Nunca coloque a chave diretamente em `src/App.jsx`: tudo que fica em `src` é enviado ao navegador e pode ser visto por outras pessoas. Este projeto usa `api/claude.js` para manter a chave no servidor.

## Publicar pelo PowerShell (alternativa)

Com Node.js instalado, abra o PowerShell dentro da pasta extraída e execute:

```powershell
npm install
npx vercel
```

Responda às perguntas da Vercel, faça login e, ao terminar, publique a versão definitiva:

```powershell
npx vercel --prod
```

## Testar no computador

```powershell
npm install
npm run dev
```

Abra o endereço mostrado no terminal. Sem `ANTHROPIC_API_KEY`, o app usa o conteúdo interno de reserva quando a IA não estiver disponível.

Para testar também a função de IA no computador, use `npx vercel dev` depois de vincular o projeto à sua conta da Vercel.
