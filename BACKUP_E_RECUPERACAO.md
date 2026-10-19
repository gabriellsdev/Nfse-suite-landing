# Política e Procedimento de Backup e Recuperação de Desastres (DRP)

**Aplicação:** NFSe Nacional Suite — Landing Page & Serviços Fiscais  
**Última Revisão:** Outubro de 2026  
**Responsável Técnico:** Gabriel Vinicius dos Santos  

---

## 1. Estratégia de Backups Automatizados

### 1.1. Código-fonte, Assets e Artefatos do Site
- **Frequência:** Semanal automática (todo domingo às 03:00 UTC) e a cada *commit/push* na *branch* `main`.
- **Workflow:** `.github/workflows/backup.yml`
- **Retenção:** 90 dias nos artefatos do GitHub Actions + histórico completo e imutável no versionamento Git (`origin/main`).
- **Conteúdo Preservado:** Código-fonte integral (`src/`), assets gráficos em alta resolução (`public/`, `dist/`), documentação jurídica e legal (`privacidade.html`, `termos.html`, `eula.html`), dependências bloqueadas (`package-lock.json`) e configurações de infraestrutura (`vercel.json`, `_headers`).

### 1.2. Banco de Dados e Licenciamento (Supabase)
- **Frequência:** Snapshots diários automatizados gerenciados pela infraestrutura Postgres do Supabase (Point-in-time Recovery - PITR).
- **Conteúdo:** Perfis de usuários cadastrados (via Google OAuth), datas de ativação do teste de 15 dias e status das licenças contratadas.
- **Isolamento:** **Nenhum XML de cliente, certificado digital ou chave privada é gravado no banco de dados**, garantindo que a base de dados não contenha segredos tributários sensíveis.

### 1.3. Dados Locais do Usuário (Desktop)
- O software opera em regime *100% local*. Os arquivos XMLs, relatórios PDF e planilhas ficam na pasta escolhida pelo usuário e o cache de licença em `%LOCALAPPDATA%\NFSe_Nacional\`. O usuário pode realizar backup dessa pasta copiando-a para um drive externo ou nuvem corporativa (OneDrive / Google Drive).

---

## 2. Procedimento de Restauração Emergencial (Runbook)

### Cenário 1: Restauração da Landing Page a partir de um Snapshot

1. **Baixar o Artefato:**
   - Acesse o repositório no GitHub: `Ações (Actions) > Backup Automatizado e Rotina de Preservação`.
   - Selecione a execução mais recente e baixe o artefato `nfse_suite_backup_YYYYMMDD_HHMMSS.tar.gz`.

2. **Extração Local:**
   ```bash
   tar -xzf nfse_suite_backup_YYYYMMDD_HHMMSS.tar.gz
   cd backup_snapshot_YYYYMMDD_HHMMSS
   ```

3. **Reinstalação de Dependências e Build:**
   ```bash
   npm ci
   npm run build
   ```

4. **Publicação / Re-deploy:**
   - Para Vercel:
     ```bash
     vercel --prod
     ```
   - Para GitHub Pages / Cloudflare Pages:
     Faça o push do conteúdo restaurado para a branch `main` ou submeta a pasta `dist/` gerada.

---

### Cenário 2: Restauração de Licenciamento (Supabase)

1. Acesse o painel de administração do Supabase em `Database > Backups`.
2. Localize o backup do dia desejado ou selecione o ponto no tempo (PITR).
3. Clique em **Restore to this point**.
4. Teste a validação de licenças disparando uma requisição de consulta no endpoint de validação.

---

## 3. Teste Periódico de Integridade
A integridade dos backups é validada trimestralmente através do download do artefato gerado pelo GitHub Actions e execução dos comandos `npm ci && npm run build` em um ambiente limpo.
