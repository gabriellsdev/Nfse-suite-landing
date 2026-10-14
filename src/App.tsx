import { useState } from 'react';
import DesktopMockup from './components/DesktopMockup';
import SidePanelMockup from './components/SidePanelMockup';
import {
  Download,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  CheckCircle2,
  Lock,
  ArrowRight,
  Building2,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  KeyRound,
  FileCheck,
  Monitor,
  Globe
} from 'lucide-react';

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mockupTab, setMockupTab] = useState<'desktop' | 'extension'>('desktop');

  const faqs = [
    {
      q: 'O programa funciona com Certificado Digital A1 e A3?',
      a: 'Sim. A aplicação interage com o repositório nativo de certificados do Windows (Windows Certificate Store). Certificados A1 (.pfx instalados) e certificados A3 (cartão ou token USB com driver ativo no sistema) são reconhecidos para a autenticação mTLS.',
    },
    {
      q: 'Preciso da extensão do Chrome ou posso usar apenas o aplicativo Desktop?',
      a: 'O aplicativo Desktop é 100% autônomo: ele conecta diretamente ao Ambiente de Dados Nacional (ADN), faz o download de notas em lote e gera os PDFs e planilhas sem precisar de navegador. A extensão do Chrome é um componente complementar para quem prefere acompanhar e disparar downloads pelo painel lateral enquanto navega.',
    },
    {
      q: 'Como o Suite evita o CAPTCHA do portal web nfse.gov.br?',
      a: 'O portal web tradicional impõe CAPTCHA e download individual nota por nota. O NFSe Nacional Suite conecta-se diretamente à API oficial do Ambiente de Dados Nacional (ADN) prevista na NT 008/2026 da Receita Federal, utilizando autenticação criptográfica mTLS via certificado digital, onde a transferência em lote é autorizada sem CAPTCHA.',
    },
    {
      q: 'Meus certificados e notas fiscais são enviados para algum servidor externo?',
      a: 'Não. O software adota uma arquitetura estritamente Local-First. As chaves privadas dos certificados nunca saem do mecanismo de segurança do Windows e todo o tráfego ocorre diretamente entre o seu computador e os servidores oficiais do governo (SERPRO/Receita Federal). Nenhum XML ou dado fiscal trafega por servidores nossos.',
    },
    {
      q: 'O que acontece com os meus arquivos fiscais ao atualizar ou desinstalar o programa?',
      a: 'Seus arquivos estão 100% seguros. O instalador foi projetado com isolamento de dados: notas baixadas, relatórios em PDF e planilhas Excel permanecem intactos na pasta do usuário mesmo se o programa for desinstalado ou atualizado para uma versão mais recente.',
    },
    {
      q: 'Existe período de teste para escritórios contábeis?',
      a: 'Sim! Estamos liberando um período de acesso antecipado gratuito de 15 dias para você validar a ferramenta durante o fechamento fiscal do mês com seus próprios clientes.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400 font-bold text-lg shadow-sm">
              <FileCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">NFSe Nacional</span>
              <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Suite
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fluxo" className="hover:text-slate-900 transition-colors">Como Funciona</a>
            <a href="#entregaveis" className="hover:text-slate-900 transition-colors">Relatórios & PDFs</a>
            <a href="#demonstracao" className="hover:text-slate-900 transition-colors">Telas</a>
            <a href="#seguranca" className="hover:text-slate-900 transition-colors">Segurança</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#download"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Baixar para Windows</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Padrão Nacional · Ambiente de Dados Nacional (ADN NT 008/2026)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              NFS-e organizada sem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                baixar nota por nota.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8">
              Automatize a coleta em lote no Ambiente de Dados Nacional e gere DANFSe agrupados e planilhas gerenciais prontas para conferência contábil e fiscal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a
                href="#download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white text-base font-bold px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>Baixar para Windows</span>
                <span className="text-xs bg-teal-800/60 px-2 py-0.5 rounded text-teal-100 font-normal">v1.4.5</span>
              </a>

              <a
                href="#fluxo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-base font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs"
              >
                <span>Ver como funciona</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Sem depender de CAPTCHA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Conexão mTLS direta com Certificado A1/A3
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                100% Local (Dados no seu PC)
              </span>
            </div>
          </div>

          {/* Desktop Frame Mockup */}
          <div className="relative mx-auto max-w-4xl pt-2">
            <DesktopMockup />
          </div>
        </div>
      </section>

      {/* 3. O Trabalho Antes e Depois (Jornada) */}
      <section id="fluxo" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Comparativo Operacional</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A rotina do fechamento fiscal: antes vs. agora
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Antes */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-8">
              <div className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Rotina Manual no Portal Web
              </div>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Download nota por nota:</strong> Abrir cada NFS-e manualmente para clicar em baixar XML e PDF.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>CAPTCHAs frequentes:</strong> Interrupções constantes no fluxo de trabalho a cada consulta.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Cobrança de clientes:</strong> Aguardar o cliente lembrar de enviar os arquivos fiscais por e-mail no final do mês.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Conferência lenta:</strong> Cruzar manualmente quais notas têm ISS retido, tributado ou isento em planilhas manuais.</span>
                </li>
              </ul>
            </div>

            {/* Depois */}
            <div className="rounded-2xl border border-teal-300 bg-teal-50/40 p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 text-teal-800 font-bold text-sm mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Com o NFSe Nacional Suite
              </div>
              <ul className="space-y-4 text-slate-700 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Download em lote com 1 clique:</strong> Todas as notas emitidas e tomadas do período baixadas em segundos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Sem CAPTCHA:</strong> Conexão mTLS direta com a API do Ambiente de Dados Nacional (ADN).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Autonomia contábil:</strong> Baixe direto da fonte usando o Certificado Digital A1/A3 da empresa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Planilha e DANFSes prontos:</strong> Resumo discriminado do ISS por situação tributária gerado na hora.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* O Fluxo Simples */}
          <div className="border-t border-slate-200 pt-12">
            <div className="text-center mb-10">
              <h3 className="text-xl font-bold text-slate-900">Como funciona em 3 etapas</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Conectar</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O aplicativo identifica os Certificados Digitais A1/A3 instalados no seu Windows. Selecione a empresa desejada.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Processar</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Escolha o mês/ano de competência ou emissão. O motor fiscal baixa os XMLs autenticados direto do ADN.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Revisar Arquivos</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Os arquivos são salvos na pasta: DANFSe oficial em PDF agrupado e planilha Excel com análise de ISS pronta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. O que é Entregue (Entregáveis Fiscais) */}
      <section id="entregaveis" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Entregáveis Prontos</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              O resultado operacional que seu escritório recebe
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Não vendemos apenas código ou download de arquivos: entregamos documentos organizados e prontos para a conferência fiscal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Planilha com Quadro ISS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">Planilha Gerencial Excel (.xlsx)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Gera um relatório que apresenta a situação dos documentos e reúne informações financeiras e tributárias em uma estrutura única, facilitando a conferência e a consulta dos dados.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 mb-4 space-y-1">
                <div>• Resumo Financeiro</div>
                <div>• Centralização Fiscal</div>
                <div>• Acompanhamento Tributário</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Ideal para conferência contábil
              </span>
            </div>

            {/* Card 2: DANFSe em PDF */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">DANFSe Oficial Agrupado (PDF)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                O motor fiscal renderiza o Documento Auxiliar da NFS-e (DANFSe) no layout padrão nacional, pronto para visualização, impressão ou envio.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 mb-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>PDF único consolidado do mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>PDFs individuais de cada nota</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Relatório sintético de serviços</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                Sanitizado contra injeções
              </span>
            </div>

            {/* Card 3: ZIP de XMLs Autenticados */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">XMLs Autenticados (.zip)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Baixa os arquivos XML originais assinados digitalmente pela autoridade tributária da Receita Federal (ICP-Brasil).
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 mb-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Notas emitidas e tomadas (recebidas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cruza eventos de cancelamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Importável em sistemas contábeis</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Validade jurídica plena
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Demonstração Visual do Produto (Mockups Interativos) */}
      <section id="demonstracao" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">O Produto em Ação</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Interface pensada para alta produtividade fiscal
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Alterne entre o aplicativo Desktop autônomo e a extensão integrada para o Google Chrome.
            </p>

            {/* Alternador de Mockup Desktop / Extensão */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 mt-6">
              <button
                onClick={() => setMockupTab('desktop')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mockupTab === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4 text-teal-600" />
                <span>Aplicativo Desktop (Windows)</span>
              </button>
              <button
                onClick={() => setMockupTab('extension')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mockupTab === 'extension'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Extensão Google Chrome (Side Panel)</span>
              </button>
            </div>
          </div>

          {/* MOCKUP 1: DESKTOP APPLICATION */}
          {mockupTab === 'desktop' && (
            <div className="relative mx-auto max-w-4xl transition-all duration-300">
              <DesktopMockup />

              {/* Floating Pill Callouts */}
              <div className="hidden lg:flex items-center justify-center gap-4 mt-6">
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Planilha Excel com Quadro Resumo de ISS por Situação</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">DANFSe Oficial em PDF Agrupado do Mês</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Chaves privadas protegidas no Windows</span>
                </div>
              </div>
            </div>
          )}

          {/* MOCKUP 2: CHROME EXTENSION SIDE PANEL */}
          {mockupTab === 'extension' && (
            <div className="relative mx-auto max-w-5xl transition-all duration-300">
              {/* Chrome Browser Window Frame */}
              <div className="rounded-2xl border border-slate-300 bg-slate-900/5 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
                <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                  {/* Chrome Browser Tab Bar */}
                  <div className="h-10 bg-slate-200 border-b border-slate-300 px-3 flex items-center justify-between select-none">
                    <div className="flex items-center gap-1.5">
                      {/* Active Tab */}
                      <div className="bg-white px-3.5 py-1.5 rounded-t-lg border-t-2 border-teal-500 flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Portal da NFS-e Nacional</span>
                        <span className="text-[10px] text-slate-400 ml-1">✕</span>
                      </div>
                      {/* Inactive Tab */}
                      <div className="px-3 py-1.5 text-xs text-slate-500 flex items-center gap-2 hover:bg-slate-300/60 rounded-t-lg transition-colors">
                        <span>Receita Federal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                    </div>
                  </div>

                  {/* Chrome Omnibox / Address Bar */}
                  <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>←</span>
                      <span>→</span>
                      <span>↻</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-auto bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-full px-4 py-1.5 flex items-center gap-2 text-slate-600 text-xs transition-colors">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-700">https://www.nfse.gov.br/portal/painel-contribuinte</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Pinned Extension Icon */}
                      <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md text-[11px] font-bold">
                        <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>NFSe-Bridge</span>
                      </div>
                      <span className="text-slate-400">⋮</span>
                    </div>
                  </div>

                  {/* Browser Body with Sidepanel Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-100">
                    {/* Simulated Portal Content (Background Webpage) */}
                    <div className="hidden md:block md:col-span-7 p-8 border-r border-slate-200 bg-white">
                      <div className="max-w-md mx-auto space-y-5 pt-8">
                        <div className="h-7 w-3/4 bg-slate-100 rounded-md animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
                        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                          <div className="h-4 w-full bg-slate-200/80 rounded"></div>
                          <div className="h-4 w-4/5 bg-slate-200/80 rounded"></div>
                          <div className="h-10 w-2/5 bg-teal-600/20 rounded-lg mt-4"></div>
                        </div>
                        <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 leading-relaxed">
                          Navegue normalmente pelo portal oficial enquanto a extensão consulta, baixa e sincroniza notas em segundo plano no painel lateral à direita.
                        </div>
                      </div>
                    </div>

                    {/* Integrated Sidepanel (Native UI - Exact Extension Look) */}
                    <div className="col-span-12 md:col-span-5 bg-[#f8fafc] border-l border-slate-200">
                      <SidePanelMockup />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Callouts */}
              <div className="hidden lg:flex items-center justify-center gap-4 mt-6">
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Abre na barra lateral sem fechar a página de trabalho</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Comunicação local nativa por stdio seguro</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Segurança e Conformidade (Sem exageros) */}
      <section id="seguranca" className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-teal-400 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparência Técnica</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Feito para uma rotina fiscal segura e auditável
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Eliminamos intermediários na nuvem. A segurança de dados fiscais é um pilar não negociável do projeto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Certificado Digital no Windows</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                O Suite utiliza a infraestrutura de certificados nativa do Windows (Windows Certificate Store). Suas chaves privadas nunca são exportadas nem enviadas pela internet.
              </p>
              <div className="text-[11px] text-teal-400 font-mono">mTLS Direto SERPRO/ADN</div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Privacidade Documentada (LGPD)</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Arquitetura estritamente Local-First. As notas baixadas, cadastros e relatórios ficam armazenados exclusivamente no seu computador.
              </p>
              <a
                href="/nfse-nacional/privacidade.html"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-medium"
              >
                <span>Ler Política de Privacidade</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Tolerância Offline de 72 Horas</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Prevista no Contrato de Licença (EULA): caso haja oscilação na internet ou manutenção em servidores, o aplicativo permite operar offline por até 72h consecutivas.
              </p>
              <a
                href="/nfse-nacional/eula.html"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-medium"
              >
                <span>Consultar EULA comercial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 text-center max-w-3xl mx-auto">
            <strong>Nota de Isenção:</strong> O NFSe Nacional Suite é um software de produtividade independente que consome a API oficial do Ambiente de Dados Nacional (ADN NT 008/2026). Não possui vínculo, endosso institucional ou certificação oficial da Receita Federal do Brasil.
          </div>
        </div>
      </section>

      {/* 7. Para Quem É (Perfis) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Público-Alvo</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Desenvolvido para quem lida com rotina fiscal intensa
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Escritórios de Contabilidade & BPOs</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Gerencie múltiplos clientes no mesmo computador com histórico separado por CNPJ. Não perca mais prazos esperando clientes enviarem XMLs e entregue as apurações de ISS e impostos federais em dia.
                </p>
                <div className="text-xs font-semibold text-teal-700">✓ Testado durante 15 dias de fechamento fiscal real</div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Empresas Prestadoras & Tomadoras</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Mantenha a guarda de todos os XMLs emitidos e recebidos, audite o faturamento mensal e gere os comprovantes de retenção de impostos sem complicação.
                </p>
                <div className="text-xs font-semibold text-teal-700">✓ Organização automática por competência e mês</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Como Começar / Download */}
      <section id="download" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-4">
            <Download className="w-4 h-4 text-teal-600" />
            <span>Instalação Rápida e Unificada</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Pronto para economizar horas no fechamento fiscal?
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mb-8">
            Instalador único com o aplicativo Desktop e o componente de integração para o navegador Google Chrome.
          </p>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md mx-auto mb-8 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-slate-900">NFSe Nacional Suite</h4>
                <p className="text-xs text-slate-500">Versão 1.4.5 para Windows</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Estável
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-2.5 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Instalador oficial `.exe` (Inno Setup)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Compatível com Windows 10 e Windows 11 (64-bit)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Preservação garantida de dados fiscais</span>
              </li>
            </ul>

            <a
              href="https://github.com/gabriellsdev/BatNFS/releases/latest"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Baixar Instalador Oficial (.exe)</span>
            </a>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Requer Certificado Digital ICP-Brasil (A1 ou A3) ativo no computador.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ e Objeções */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Tire suas dúvidas</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Perguntas Frequentes
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-sm">NFSe Nacional Suite</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href="/nfse-nacional/privacidade.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="/nfse-nacional/eula.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Contrato EULA
              </a>
              <a
                href="mailto:suporte.nfsebridge@gmail.com"
                className="hover:text-white transition-colors"
              >
                Suporte Técnico
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              © 2026 NFSe Nacional Suite. Todos os direitos reservados.
            </div>

            <div>
              Desenvolvido por{' '}
              <a
                href="https://gabriellsdev.github.io"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-teal-400 font-medium transition-colors inline-flex items-center gap-1"
              >
                <span>Gabriel Santos</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
