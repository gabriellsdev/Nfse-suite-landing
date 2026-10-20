# Plano SEO revisado — NFSe Nacional Suite

**Verificação:** 20/10/2026. **Escopo:** site público e plano recebido. Os arquivos preparados para publicação estão separados nesta pasta.

## Diagnóstico confirmado

A página inicial já entrega um título claro, descrição, canonical, Open Graph/Twitter Card, `robots.txt` acessível e sitemap XML. O texto comercial é extenso e descreve funcionalidades, requisitos, demonstrações, preços e dúvidas frequentes.

O HTML recebido pelo navegador contém, porém, apenas o contêiner `#root`; o conteúdo principal aparece depois que o JavaScript do aplicativo executa. Isso não torna a página automaticamente invisível para o Google, mas deixa a descoberta e a leitura do conteúdo dependentes da renderização JavaScript e pode limitar outros rastreadores. A documentação do Google recomenda considerar renderização no servidor ou pré-renderização quando isso melhora a disponibilidade do conteúdo: [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

O sitemap atual lista a home e três páginas legais. As datas `lastmod`, `changefreq` e `priority` encontradas não demonstram, por si só, atualização real nem preferência do Google; o sitemap revisado omite esses campos até haver datas de alteração confiáveis.

## Correções importantes ao plano original

1. **FAQ rich results:** não implementar `FAQPage` esperando acordeões no Google. A documentação oficial registra que esse recurso deixou de aparecer na Pesquisa Google em 7 de maio de 2026. As perguntas e respostas continuam úteis como conteúdo normal para visitantes. [Atualizações oficiais do Google](https://developers.google.com/search/updates#removing-faq-rich-result).

2. **`SoftwareApplication`:** o exemplo do plano não é elegível, como está, para o rich result de aplicativo do Google: a documentação atual lista preço e avaliação/review entre os requisitos. Não há avaliações públicas fornecidas para inserir. Não inventar estrelas nem avaliação. A marcação estruturada pode descrever conteúdo, mas não garante exibição especial nem melhora automática de posição. [Requisitos de Software app](https://developers.google.com/search/docs/appearance/structured-data/software-app).

3. **Fallback dentro de `#root`:** não usar um bloco estático que o React substitui na inicialização como solução de SEO. Isso não equivale a uma página pré-renderizada estável e pode causar diferença/flicker. A correção recomendada é gerar HTML da home e de cada rota pública com SSG, SSR ou pré-renderização real e testar a resposta HTTP sem JavaScript.

4. **Título e palavras-chave:** manter por ora o título e a descrição atuais, que já descrevem coleta em lote, NFS-e/ADN, certificados, DANFSe e Excel. O H1 mostrado no navegador também é compreensível. A principal deficiência observada é ele não existir no HTML inicial. Não trocar por um H1 artificialmente longo nem repetir termos sem evidência de demanda.

5. **Volume de busca e backlinks:** as expressões e volumes citados no plano não vêm acompanhados de dados de Search Console ou ferramenta de palavras-chave; tratá-los como hipóteses. A alegação de que um link da Chrome Web Store transmite autoridade “95+” ou melhora ranking imediatamente não é verificável e não deve orientar a estratégia. Buscar referências legítimas e úteis, sem postagem em massa em fóruns.

6. **IndexNow:** é uma opção para os mecanismos participantes, como Bing, Naver, Seznam, Yandex e Yep, mas não substitui Search Console nem é um mecanismo para solicitar indexação ao Google. [Lista oficial de participantes](https://www.indexnow.org/).

7. **Search Console:** não é necessário inserir uma meta tag sem o token de verificação da propriedade. O proprietário pode verificar a propriedade do domínio pelo método disponível na conta (por exemplo, DNS), enviar o sitemap e usar Inspeção de URL e relatórios de indexação. Não solicitei indexação nem alterei DNS.

## Implementado nesta entrega

- `como-baixar-nfse-em-lote.html`: guia editorial estático, responsivo e legível sem JavaScript, com conteúdo alinhado às informações públicas do produto, canonical, metadados sociais, headings semânticos e links para a home e páginas legais. Não usa marcação `FAQPage` nem avaliações.
- `sitemap.xml`: mantém as quatro URLs atuais e adiciona o guia. Não inclui `lastmod` porque não há confirmação da data real de publicação/alteração; não inclui `priority`/`changefreq`.

## Para publicar com segurança

1. Colocar os dois arquivos na raiz publicada do domínio. O caminho final do guia deve ser `https://nfsesuite.com.br/como-baixar-nfse-em-lote.html`.
2. Substituir o sitemap publicado pelo arquivo revisado, depois de confirmar que todas as URLs listadas continuam respondendo `200` e usando canonical correspondente.
3. Criar um link interno para o guia a partir da home, por exemplo na área de dúvidas/recursos ou no rodapé. Não foi possível editar essa navegação sem os arquivos-fonte.
4. Corrigir a renderização da home no repositório: servir HTML inicial com texto principal, H1/H2, links e metadados por SSG/SSR/pré-renderização real. Depois, validar a resposta publicada com e sem JavaScript e em Inspeção de URL.
5. Na propriedade do Search Console, enviar o sitemap e medir impressões, cliques e consultas antes de criar novas páginas. Atualizar `lastmod` apenas quando o conteúdo de uma URL mudar de forma significativa.

## Limite da implementação nesta sessão

Os arquivos-fonte/repositório do site não estão presentes e não foi possível acessar a hospedagem a partir desta sessão. Portanto, os arquivos acima estão preparados para integração, mas **não foram publicados**; o HTML da home e sua navegação permanecem inalterados. A renderização da home e a configuração do Search Console exigem acesso ao projeto e à propriedade do domínio.
