import { useState, useEffect } from 'react';
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
  Globe,
  Menu,
  X,
  Laptop
} from 'lucide-react';

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mockupTab, setMockupTab] = useState<'desktop' | 'extension'>('desktop');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // ScrollSpy com IntersectionObserver para rastrear a seção ativa
  useEffect(() => {
    const sectionIds = [
      'hero',
      'como-funciona',
      'entregaveis',
      'comparativo',
      'publico',
      'demonstracao',
      'seguranca',
      'download',
      'faq',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.1,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'entregaveis', label: 'Relatórios & PDFs' },
    { id: 'comparativo', label: 'Comparativo' },
    { id: 'demonstracao', label: 'Telas' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'faq', label: 'Dúvidas' },
  ];

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

  const steps = [
    {
      number: '01',
      title: 'Conectar Certificado',
      badge: 'Windows Certificate Store',
      description:
        'O aplicativo localiza automaticamente os Certificados Digitais A1 (.pfx) ou A3 (Token/Cartão) instalados no Windows. Sem necessidade de cadastrar senhas na nuvem.',
      bullets: [
        'Detecção nativa de A1 e A3 sem burocracia',
        'Alternância rápida entre CNPJs de clientes',
        'Chaves privadas 100% protegidas no computador',
      ],
    },
    {
      number: '02',
      title: 'Processar Lote no ADN',
      badge: 'API Oficial NT 008/2026',
      description:
        'Selecione o período (mês atual, anterior ou datas customizadas). O motor fiscal consulta o Ambiente de Dados Nacional e realiza o download das notas emitidas e tomadas.',
      bullets: [
        'Sem CAPTCHAs ou bloqueios manuais',
        'Download em lote simultâneo em segundos',
        'Separação automática de notas emitidas e tomadas',
      ],
    },
    {
      number: '03',
      title: 'Gerar DANFSe & Planilhas',
      badge: 'Entregáveis Prontos',
      description:
        'Todos os arquivos são organizados na sua pasta: DANFSe oficial agrupado em PDF para conferência visual e planilha Excel completa com análise de ISS discriminada.',
      bullets: [
        'PDF consolidado único por competência',
        'Planilha Excel (.xlsx) com conferência de ISS',
        'XMLs originais com validade jurídica mantida',
      ],
    },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Identidade Visual / Marca Perfeitamente Alinhada */}
          <a
            href="#hero"
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400 font-bold text-lg shadow-sm shrink-0 group-hover:bg-slate-800 transition-colors">
              <FileCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                NFSe Nacional
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 leading-none inline-flex items-center self-center shadow-2xs">
                Suite
              </span>
            </div>
          </a>

          {/* Navegação Desktop com Indicador Ativo e Transição Suave */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1.5 transition-colors ${
                    isActive
                      ? 'text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full transition-all" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Botão de Ação do Header + Botão Mobile */}
          <div className="flex items-center gap-3">
            <a
              href="#download"
              onClick={() => handleNavClick('download')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow"
            >
              <Download className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Baixar para Windows</span>
            </a>

            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Dropdown Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 pt-2 pb-4 space-y-1 backdrop-blur-md animate-in fade-in duration-200">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border-l-4 border-teal-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-4rem)] flex items-center py-12 lg:py-16 xl:py-6 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid xl:grid-cols-12 gap-10 xl:gap-12 items-center">
            
            {/* Coluna Esquerda: Comunicação e CTAs Duplos (Desktop & Extensão) */}
            <div className="xl:col-span-5 text-center xl:text-left flex flex-col items-center xl:items-start">
              
              {/* Badge Topo */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Padrão Nacional · Ambiente de Dados Nacional (ADN NT 008/2026)</span>
              </div>

              {/* Título com Destaque de Alto Contraste */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[2.85rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
                NFS-e organizada sem{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700">
                  baixar nota por nota.
                </span>
              </h1>

              {/* Parágrafo de Valor */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-7 max-w-xl">
                Automatize a coleta em lote no Ambiente de Dados Nacional e gere DANFSe agrupados e planilhas gerenciais prontas para conferência contábil e fiscal.
              </p>

              {/* Ações / CTAs Diferenciados: Desktop + Extensão */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-3.5 mb-4">
                
                {/* CTA Primário: Download Desktop */}
                <a
                  href="#download"
                  onClick={() => handleNavClick('download')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white text-base font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98 whitespace-nowrap group"
                >
                  <Download className="w-5 h-5 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  <span>Baixar para Windows</span>
                  <span className="text-xs bg-teal-800/60 px-2 py-0.5 rounded text-teal-100 font-normal">v1.4.5</span>
                </a>

                {/* CTA Secundário: Conhecer a Extensão Chrome */}
                <a
                  href="#demonstracao"
                  onClick={() => {
                    setMockupTab('extension');
                    handleNavClick('demonstracao');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 text-base font-semibold px-5 py-3.5 rounded-xl transition-all shadow-xs whitespace-nowrap"
                >
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Conhecer Extensão</span>
                </a>
              </div>

              {/* Atalho para Como Funciona */}
              <div className="mb-7">
                <a
                  href="#como-funciona"
                  onClick={() => handleNavClick('como-funciona')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
                >
                  <span>Entenda como funciona em 3 etapas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Indicadores de Benefícios: Alinhamento Centralizado e Consistente */}
              <div className="w-fit mx-auto xl:mx-0 flex flex-col items-start space-y-2.5 text-xs text-slate-600 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-700">Sem depender de CAPTCHA</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Conexão mTLS direta com Certificado Digital A1 e A3</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>100% Local-First: dados e certificados seguros no seu PC</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Mockup do Produto com Proporção Otimizada */}
            <div className="xl:col-span-7 relative w-full flex justify-center mt-6 xl:mt-0">
              <div className="w-full relative">
                {/* Brilho Sutil de Profundidade */}
                <div className="absolute -inset-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl -z-10 pointer-events-none" />
                
                {/* Mockup da Janela Desktop */}
                <DesktopMockup />

                {/* Micro-chamada discreta para a extensão */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => {
                      setMockupTab('extension');
                      const el = document.getElementById('demonstracao');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors bg-white/70 px-3 py-1 rounded-full border border-slate-200 shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Também disponível como painel lateral integrado no Google Chrome</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Como Funciona (Posicionada Imediatamente após a Hero) */}
      <section id="como-funciona" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Processo Transparente</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Como funciona em 3 etapas simples
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Do reconhecimento do certificado até o DANFSe agrupado e a planilha Excel, sem intermediários.
            </p>
          </div>

          {/* Abas / Indicador de Etapas Interativo */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-6 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 shadow-sm ring-1 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-9 h-9 rounded-lg font-bold text-sm flex items-center justify-center ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-teal-400'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    {step.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chamada para ação contextual */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-600">
              Quer ver como os relatórios e PDFs são organizados na pasta?
            </span>
            <a
              href="#entregaveis"
              onClick={() => handleNavClick('entregaveis')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Ver entregáveis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Resultados e Benefícios (Entregáveis Prontos) */}
      <section id="entregaveis" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Entregáveis Prontos</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              O resultado operacional que você recebe na pasta
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
                Gera um relatório que apresenta a situação dos documentos e reúne informações financeiras e tributárias em uma estrutura única, facilitando a conferência e a apuração de ISS.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 mb-4 space-y-1">
                <div>• Resumo por Situação de ISS</div>
                <div>• Centralização de Valores Totais</div>
                <div>• Pronto para Importação Contábil</div>
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
                  <span>Importável em qualquer ERP contábil</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Validade jurídica plena
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Antes e Agora (Comparativo Operacional) */}
      <section id="comparativo" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Comparativo Operacional</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A rotina do fechamento fiscal: antes vs. agora
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
        </div>
      </section>

      {/* 6. Público-Alvo (Perfis Atendidos) */}
      <section id="publico" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Público-Alvo</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Desenvolvido para quem lida com rotina fiscal intensa
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs flex gap-6">
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

            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs flex gap-6">
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

      {/* 7. Interface da Aplicação / Telas (Demonstração Visual) */}
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

      {/* 8. Transparência Técnica & Segurança */}
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
                href="./privacidade.html"
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
                href="./eula.html"
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

      {/* 9. Chamada para Ação Final e Instalação (Dual: Desktop & Extensão) */}
      <section id="download" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-3">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Acesso Imediato</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Pronto para economizar horas no fechamento fiscal?
            </h2>
            <p className="text-slate-600 text-sm">
              Escolha a forma que melhor se adapta à sua rotina: aplicativo desktop autônomo ou extensão integrada no navegador.
            </p>
          </div>

          {/* Cards de Ação Comercial / Instalação */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Card 1: Aplicativo Desktop */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Aplicativo Desktop</h3>
                      <p className="text-xs text-slate-500">Versão v1.4.5 para Windows</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Estável
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Solução completa e autônoma. Conecta direto ao ADN, realiza downloads em lote massivos e gera os DANFSes e a planilha Excel com 1 clique.
                </p>

                <ul className="text-xs text-slate-600 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Instalador oficial `.exe` seguro (Inno Setup)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Compatível com Windows 10 e Windows 11 (64-bit)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>15 dias de teste grátis sem cartão de crédito</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href="https://github.com/gabriellsdev/BatNFS/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Instalador Desktop (.exe)</span>
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Preservação integral dos dados fiscais na máquina.
                </p>
              </div>
            </div>

            {/* Card 2: Extensão Chrome */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Extensão Chrome</h3>
                      <p className="text-xs text-slate-500">Painel Lateral (Side Panel)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Navegador
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Ideal para quem já navega pelo portal oficial `nfse.gov.br`. Dispare downloads e consulte informações sem precisar sair da aba de trabalho.
                </p>

                <ul className="text-xs text-slate-600 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Integrada à barra lateral nativa do Google Chrome</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Manifest V3 com comunicação local via Native Messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Conexão direta mTLS utilizando seu certificado A1/A3</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href="#demonstracao"
                  onClick={() => {
                    setMockupTab('extension');
                    handleNavClick('demonstracao');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <Globe className="w-4 h-4 text-teal-400" />
                  <span>Explorar Extensão no Navegador</span>
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Acompanhe e baixe diretamente durante a navegação.
                </p>
              </div>
            </div>

          </div>

          <div className="text-center text-xs text-slate-500 max-w-xl mx-auto">
            Requer Certificado Digital ICP-Brasil (A1 ou A3) ativo no computador. Funcionamento 100% Local-First.
          </div>
        </div>
      </section>

      {/* 10. FAQ e Objeções (Perguntas Frequentes Preservadas) */}
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
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm transition-colors"
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

      {/* 11. Footer com Contato Oficial */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            
            {/* Marca no Footer */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 font-bold shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">NFSe Nacional</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                  Suite
                </span>
              </div>
            </div>

            {/* Links Institucionais e Contato Oficial Documentado */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <a
                href="./privacidade.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="./eula.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Contrato EULA
              </a>
              <a
                href="mailto:suporte.nfsebridge@gmail.com"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <span>Contato: suporte.nfsebridge@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              © 2026 NFSe Nacional Suite (BatNFS). Todos os direitos reservados.
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
