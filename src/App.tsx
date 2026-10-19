import { useState, useEffect } from 'react';
import DesktopMockup from './components/DesktopMockup';
import SidePanelMockup from './components/SidePanelMockup';
import CookieBanner from './components/CookieBanner';
import ContactModal from './components/ContactModal';
import { initAnalyticsIfConsented, trackEvent } from './utils/analytics';
import {
  DEFAULT_APP_VERSION,
  DEFAULT_DOWNLOAD_URL,
  LATEST_RELEASE_API,
} from './version';
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
  const [previewTab, setPreviewTab] = useState<'excel' | 'danfse'>('excel');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>(DEFAULT_APP_VERSION);
  const [downloadUrl, setDownloadUrl] = useState<string>(DEFAULT_DOWNLOAD_URL);

  // Inicializa Analytics de forma segura (somente se previamente consentido)
  useEffect(() => {
    initAnalyticsIfConsented();
  }, []);

  // Consulta dinâmica da release mais recente no GitHub
  useEffect(() => {
    fetch(LATEST_RELEASE_API)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao consultar release');
        return res.json();
      })
      .then((data) => {
        if (data && data.tag_name) {
          const rawVersion = String(data.tag_name).replace(/^v/, '').trim();
          if (rawVersion) {
            setAppVersion(rawVersion);
          }
          if (Array.isArray(data.assets)) {
            // Procura o executável unificado de instalação da suíte
            const setupAsset = data.assets.find(
              (a: { name?: string; browser_download_url?: string }) =>
                typeof a.name === 'string' &&
                a.name.endsWith('.exe') &&
                a.name.toLowerCase().includes('setup')
            );
            if (setupAsset && setupAsset.browser_download_url) {
              setDownloadUrl(setupAsset.browser_download_url);
            }
          }
        }
      })
      .catch(() => {
        // Mantém os valores padrão de fallback de version.ts
      });
  }, []);

  // ScrollSpy com IntersectionObserver para rastrear a seção ativa
  useEffect(() => {
    const sectionIds = [
      'hero',
      'como-funciona',
      'entregaveis',
      'comparativo',
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
    { id: 'entregaveis', label: 'Entregáveis' },
    { id: 'demonstracao', label: 'Telas' },
    { id: 'seguranca', label: 'Privacidade' },
    { id: 'download', label: 'Planos' },
    { id: 'faq', label: 'Dúvidas' },
  ];

  const faqs = [
    {
      q: 'Tanto o aplicativo Desktop quanto a Extensão funcionam com Certificado A1 e A3?',
      a: 'Sim. Tanto o aplicativo Desktop quanto a extensão NFSe-Bridge (através do componente Native Host instalado no Windows) acessam o repositório oficial de certificados do Windows (Windows Certificate Store). Assim, certificados A1 (.pfx instalados no sistema) e certificados A3 (token ou cartão com driver ativo no Windows) são compatíveis nas duas interfaces.',
    },
    {
      q: 'Qual a ordem correta para instalar o aplicativo Desktop e a Extensão do Chrome?',
      a: 'Se você pretende usar apenas o aplicativo Desktop, basta baixar e executar o instalador para Windows (.exe). Se desejar usar também a extensão no navegador, recomendamos: 1º instalar o pacote para Windows (.exe), que já inclui e registra automaticamente o Native Host local, e 2º adicionar a extensão NFSe-Bridge pela Chrome Web Store.',
    },
    {
      q: 'Como funciona a coleta sem digitação manual de CAPTCHA?',
      a: 'Enquanto a consulta visual no portal web exige preenchimento de CAPTCHA e download individual, o NFSe Nacional Suite atua como um conector independente que se comunica diretamente com a API do Ambiente de Dados Nacional (ADN — NT 008/2026) via autenticação mTLS com o certificado digital da empresa. O tempo de download depende do volume de notas e da disponibilidade dos servidores governamentais.',
    },
    {
      q: 'O que fica apenas no meu computador e o que é consultado na internet?',
      a: 'Seus XMLs, PDFs, planilhas Excel e as chaves privadas dos certificados A1/A3 permanecem 100% no seu computador e nunca passam por servidores nossos. As únicas conexões externas são: (1) conexão mTLS direta do seu PC com a API oficial do ADN (Receita Federal) para baixar as notas; (2) consulta pública dos 14 dígitos do CNPJ na BrasilAPI para preencher Razão Social e regime tributário nos relatórios; e (3) autenticação Google OAuth/Supabase e GitHub apenas para validar seu login/licença e buscar atualizações do programa.',
    },
    {
      q: 'O teste de 15 dias gera cobrança automática? Como funciona a renovação dos planos pagos?',
      a: 'O teste gratuito de 15 dias NÃO gera nenhuma cobrança automática: ele é ativado apenas com seu login Google (sem informar cartão de crédito) e, ao final dos 15 dias, encerra-se sem custos — mantendo todos os arquivos já baixados salvos no seu PC. Somente se você decidir contratar um plano pago (Pro Individual de R$ 49/mês ou Multi-CNPJ de R$ 129/mês), a assinatura passa a ter renovação automática mensal enquanto estiver ativa, podendo ser cancelada a qualquer momento antes do próximo vencimento sem fidelidade ou multa (conforme Cláusula 8ª do EULA).',
    },
    {
      q: 'O que acontece com os meus arquivos fiscais ao atualizar ou desinstalar o programa?',
      a: 'Seus arquivos permanecem intactos. O instalador possui isolamento de dados: XMLs baixados, relatórios em PDF e planilhas Excel continuam salvos na sua pasta de documentos mesmo se você atualizar ou desinstalar o software.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Selecionar Certificado no Windows',
      badge: 'A1 e A3 via Windows Store',
      description:
        'O software lista automaticamente os Certificados Digitais A1 (.pfx) ou A3 (Token/Cartão) instalados no Windows, sem exportar chaves privadas para a nuvem.',
      bullets: [
        'Compatível com certificados A1 e A3 no Windows',
        'Alternância rápida entre CNPJs da carteira',
        'Chaves privadas permanecem no Windows Certificate Store',
      ],
    },
    {
      number: '02',
      title: 'Consultar Lote na API do ADN',
      badge: 'Conector Independente ADN',
      description:
        'Escolha a competência ou período de emissão. O conector consulta a API do Ambiente de Dados Nacional (NT 008/2026) via mTLS e baixa as notas emitidas e tomadas.',
      bullets: [
        'Sem digitação manual de CAPTCHA nota a nota',
        'Coleta automatizada em lote (conforme resposta da API)',
        'Identificação de notas autorizadas e canceladas',
      ],
    },
    {
      number: '03',
      title: 'Gerar DANFSe & Planilha de ISS',
      badge: 'Conferência Contábil',
      description:
        'Os arquivos são salvos na pasta escolhida: XMLs originais assinados, DANFSe agrupado em PDF para leitura visual e planilha Excel com resumo de ISS.',
      bullets: [
        'PDF consolidado por competência e PDFs individuais',
        'Planilha Excel (.xlsx) com quadro resumo de ISS',
        'XMLs no padrão nacional para importação em sistemas contábeis',
      ],
    },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white pt-16">
      {/* 1. Header / Navbar Fixo Sempre no Topo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Identidade Visual / Marca Perfeitamente Alinhada */}
          <a
            href="#hero"
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400 font-bold text-lg shadow-sm shrink-0 group-hover:bg-slate-800 transition-colors">
              <FileCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-none whitespace-nowrap">
                NFSe Nacional
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 leading-none inline-flex items-center self-center shadow-2xs">
                Suite
              </span>
            </div>
          </a>

          {/* Navegação Desktop Enxuta e Espaçada */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium whitespace-nowrap">
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fale Conosco
            </button>

            <a
              href="#download"
              onClick={() => handleNavClick('download')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 min-h-[38px] rounded-lg transition-all shadow-xs hover:shadow whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Baixar</span>
              <span className="hidden sm:inline">Baixar para Windows</span>
            </a>

            {/* Botão Hambúrguer Mobile / Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Menu Dropdown Mobile / Tablet */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 px-4 pt-2 pb-4 space-y-1 backdrop-blur-md max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border-l-4 border-teal-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setContactModalOpen(true);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Fale Conosco / Demonstração
            </button>

            <div className="pt-2 border-t border-slate-100">
              <a
                href={downloadUrl}
                download={`NFSe_Nacional_Suite_Setup_${appVersion}.exe`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  trackEvent('download_click', { version: appVersion, source: 'mobile_menu' });
                }}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Baixar Instalador Windows (.exe)</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-4rem)] flex items-center py-10 lg:py-14 xl:py-6 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid xl:grid-cols-12 gap-10 xl:gap-12 items-center">
            
            {/* Coluna Esquerda: Comunicação e CTAs Duplos (Desktop & Extensão) */}
            <div className="xl:col-span-5 text-center xl:text-left flex flex-col items-center xl:items-start">
              
              {/* Badge Topo */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Conector Independente · API ADN (NT 008/2026)</span>
              </div>

              {/* Título com Destaque de Alto Contraste */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[2.85rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
                NFS-e organizada sem{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700">
                  baixar nota por nota.
                </span>
              </h1>

              {/* Parágrafo de Valor */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-xl">
                Automatize a coleta em lote no Ambiente de Dados Nacional e gere DANFSe agrupados e planilhas gerenciais prontas para conferência contábil e fiscal.
              </p>

              {/* Ações / CTAs Diferenciados: Desktop + Extensão */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center xl:justify-start gap-3 mb-3">
                
                {/* CTA Primário: Download Direto do Instalador Desktop */}
                <a
                  href={downloadUrl}
                  download={`NFSe_Nacional_Suite_Setup_${appVersion}.exe`}
                  onClick={() => trackEvent('download_click', { version: appVersion, source: 'hero' })}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98 whitespace-nowrap group cursor-pointer"
                >
                  <Download className="w-5 h-5 shrink-0 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
                  <span>Baixar para Windows</span>
                  <span className="text-xs bg-teal-800/60 px-2 py-0.5 rounded text-teal-100 font-normal">v{appVersion}</span>
                </a>

                {/* CTA Secundário: Conhecer a Extensão Chrome */}
                <a
                  href="#demonstracao"
                  onClick={() => {
                    setMockupTab('extension');
                    handleNavClick('demonstracao');
                  }}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 text-sm sm:text-base font-semibold px-5 py-3.5 rounded-xl transition-all shadow-xs whitespace-nowrap"
                >
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Conhecer Extensão</span>
                </a>
              </div>

              {/* Aviso explícito de requisitos e ordem de instalação perto dos botões */}
              <div className="w-full max-w-xl bg-slate-100/90 border border-slate-200/80 rounded-lg px-3.5 py-2 text-[11px] text-slate-600 mb-5 text-left leading-relaxed">
                <strong className="text-slate-800">Requisitos:</strong> Windows 10/11 (64-bit) e Certificado Digital ICP-Brasil (A1 ou A3).{' '}
                <span className="block sm:inline">
                  Para usar a <strong>Extensão Chrome</strong>, instale primeiro o aplicativo Windows (que inclui o <em>Native Host</em>) e depois adicione a extensão.
                </span>
              </div>

              {/* Atalho para Como Funciona e Planos */}
              <div className="mb-5 flex flex-wrap items-center justify-center xl:justify-start gap-3 sm:gap-4 text-xs">
                <a
                  href="#como-funciona"
                  onClick={() => handleNavClick('como-funciona')}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <span>Como funciona em 3 etapas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="#download"
                  onClick={() => handleNavClick('download')}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <span>15 dias grátis (sem cobrança automática no teste)</span>
                </a>
              </div>

              {/* Indicadores de Benefícios: Alinhamento Centralizado e Consistente */}
              <div className="w-fit mx-auto xl:mx-0 flex flex-col items-start space-y-2 text-xs text-slate-600 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-700">Consulta em lote via API ADN sem digitar CAPTCHA nota a nota</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Conexão mTLS com Certificado Digital A1 e A3 (Windows Store)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>XMLs e chaves privadas permanecem 100% locais no seu computador</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Mockup do Produto com Proporção Otimizada */}
            <div className="xl:col-span-7 relative w-full flex justify-center mt-4 xl:mt-0">
              <div className="w-full relative">
                {/* Brilho Sutil de Profundidade */}
                <div className="absolute -inset-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl -z-10 pointer-events-none" />
                
                {/* Rótulo explícito de demonstração com dados fictícios */}
                <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <span>ℹ️ Demonstração da interface com dados fictícios (empresa e quantidades simuladas)</span>
                  </span>
                </div>

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
      <section id="como-funciona" className="py-14 sm:py-16 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Processo Transparente</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Como funciona em 3 etapas simples
            </p>
            <p className="text-slate-600 text-sm mt-2.5">
              Da leitura do certificado no Windows até o DANFSe agrupado e a planilha Excel, sem servidores intermediários para seus XMLs.
            </p>
          </div>

          {/* Abas / Indicador de Etapas Interativo */}
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-5 sm:p-6 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 shadow-sm ring-1 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
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
        </div>
      </section>

      {/* 4. Resultados e Benefícios (Entregáveis Prontos + Modelos de Demonstração) */}
      <section id="entregaveis" className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Entregáveis Prontos</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              O resultado operacional que você recebe na pasta
            </p>
            <p className="text-slate-600 text-sm mt-2.5">
              Documentos organizados por competência e prontos para conferência fiscal e importação contábil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Card 1: Planilha com Quadro ISS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Planilha Gerencial Excel (.xlsx)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Gera um relatório que apresenta a situação dos documentos e reúne informações financeiras e tributárias em uma estrutura única, facilitando a conferência e a apuração de ISS.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 mb-3 space-y-1">
                <div>• Resumo por Situação de ISS</div>
                <div>• Centralização de Valores Totais</div>
                <div>• Apoio à Conciliação Contábil</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Ideal para conferência contábil
              </span>
            </div>

            {/* Card 2: DANFSe em PDF */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">DANFSe Agrupado (PDF)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                O motor fiscal renderiza o Documento Auxiliar da NFS-e (DANFSe) no layout padrão nacional, pronto para visualização, impressão ou envio ao cliente.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 mb-3 space-y-1.5">
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
                Representação gráfica auxiliar
              </span>
            </div>

            {/* Card 3: ZIP de XMLs Autenticados */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FolderArchive className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">XMLs Originais (.zip)</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Baixa os arquivos XML originais assinados digitalmente no padrão do Ambiente de Dados Nacional (o arquivo XML é o documento fiscal com validade jurídica).
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 mb-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Notas emitidas e tomadas (recebidas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Identifica eventos de cancelamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Compatível com ERPs que importam o XML nacional</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                XML original assinado (ICP-Brasil)
              </span>
            </div>
          </div>

          {/* Modelo de Demonstração da Planilha e do DANFSe */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200 flex flex-col gap-4 bg-slate-50/70">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full mb-2">
                    <span>Modelo de Demonstração dos Arquivos</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Confira o exemplo de Relatório Excel e o exemplo de DANFSe antes de instalar
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Visualize na tela ou baixe os dois modelos de demonstração abaixo para conferir os resultados na prática.
                  </p>
                </div>

                {/* Abas responsivas: 50%/50% confortáveis no mobile e inline no desktop */}
                <div className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300 shrink-0 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('excel')}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
                      previewTab === 'excel'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="sm:hidden">Relatório (.xlsx)</span>
                    <span className="hidden sm:inline">Exemplo de Relatório (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('danfse')}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
                      previewTab === 'danfse'
                        ? 'bg-white text-blue-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="sm:hidden">DANFSe (.pdf)</span>
                    <span className="hidden sm:inline">Exemplo de DANFSe (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* Botões de download dos arquivos de demonstração lado a lado + observação */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <a
                    href="/downloads/DANFSeExemplo.pdf"
                    download="DANFSeExemplo.pdf"
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Baixar DANFSe de demonstração (PDF)</span>
                  </a>
                  <a
                    href="/downloads/RelatorioExemplo.xlsx"
                    download="RelatorioExemplo.xlsx"
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    <span>Baixar Relatório de demonstração (EXCEL)</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Arquivo gerado para demonstração; dados fictícios e sem validade fiscal.
                </p>
              </div>
            </div>

            {previewTab === 'excel' ? (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Aviso sobre o formato do modelo de demonstração vs formato completo do programa */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sobre este modelo de demonstração:</strong> A prévia abaixo reproduz a planilha demonstrativa (<code>RelatorioExemplo.xlsx</code>), dividida nas abas <em>Resumo (Mockup)</em>, <em>Emitidas - Exemplo</em> e <em>Recebidas - Exemplo</em>. No uso do programa com XMLs baixados do ADN, o relatório gerado (<code>Relatorio_NFSe_Completo.xlsx</code>) inclui adicionalmente as 30 colunas fiscais detalhadas de cada nota (alíquotas, ISSQN próprio/retido, retenções federais PIS/COFINS/IRRF/CSLL/INSS e status de cancelamento) e o quadro resumo de ISS por situação tributária.
                  </div>
                </div>

                {/* 1. Aba Resumo (Mockup) */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      1. Aba "Resumo (Mockup)" — Visão consolidada de Emitidas e Recebidas
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Empresa: EMPRESA EXEMPLO AURORA LTDA • 00.000.000/0000-00
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-emerald-900 text-white font-semibold">
                          <th className="py-2.5 px-3 border-r border-emerald-800">Indicador (Modelo de Demonstração)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-800 text-right">Emitidas (exemplo)</th>
                          <th className="py-2.5 px-3 border-r border-emerald-800 text-right">Recebidas (exemplo)</th>
                          <th className="py-2.5 px-3 text-right">Total (exemplo)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        <tr className="bg-white">
                          <td className="py-2 px-3 font-sans font-medium text-slate-800">Quantidade de registros</td>
                          <td className="py-2 px-3 text-right">4</td>
                          <td className="py-2 px-3 text-right">3</td>
                          <td className="py-2 px-3 text-right font-semibold">7</td>
                        </tr>
                        <tr className="bg-emerald-50 font-bold text-slate-900">
                          <td className="py-2.5 px-3 font-sans">Valor de serviços (R$)</td>
                          <td className="py-2.5 px-3 text-right text-emerald-800">8.426,25</td>
                          <td className="py-2.5 px-3 text-right text-blue-800">2.095,90</td>
                          <td className="py-2.5 px-3 text-right">10.522,15</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Amostra de Registros (Abas Emitidas e Recebidas) */}
                <div>
                  <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                    2. Amostra de Registros — Abas "Emitidas - Exemplo" e "Recebidas - Exemplo"
                  </span>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-800 text-white font-semibold">
                          <th className="py-2 px-3">Tipo</th>
                          <th className="py-2 px-3">Referência DEMO</th>
                          <th className="py-2 px-3">Data</th>
                          <th className="py-2 px-3">Contraparte Fictícia</th>
                          <th className="py-2 px-3">Documento Ilustrativo</th>
                          <th className="py-2 px-3">Município / Descrição de Exemplo</th>
                          <th className="py-2 px-3 text-right">Valor de Exemplo (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        <tr className="bg-white">
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-sans font-semibold">Emitida</span></td>
                          <td className="py-2 px-3 font-semibold">DEMO-001</td>
                          <td className="py-2 px-3">02/09/2026</td>
                          <td className="py-2 px-3 font-sans">CENTRO CLÍNICO IMAGINÁRIO LTDA</td>
                          <td className="py-2 px-3">00.000.000/0000-00</td>
                          <td className="py-2 px-3 font-sans text-slate-600">Toledo (fictício) • Serviço demonstrativo de diagnóstico</td>
                          <td className="py-2 px-3 text-right font-semibold">2.450,00</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-sans font-semibold">Emitida</span></td>
                          <td className="py-2 px-3 font-semibold">DEMO-002</td>
                          <td className="py-2 px-3">08/09/2026</td>
                          <td className="py-2 px-3 font-sans">GRUPO MODELO HORIZONTE S/A</td>
                          <td className="py-2 px-3">11.111.111/1111-11</td>
                          <td className="py-2 px-3 font-sans text-slate-600">Cascavel (fictício) • Atendimento técnico de exemplo</td>
                          <td className="py-2 px-3 text-right font-semibold">1.875,50</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-sans font-semibold">Emitida</span></td>
                          <td className="py-2 px-3 font-semibold">DEMO-003</td>
                          <td className="py-2 px-3">17/09/2026</td>
                          <td className="py-2 px-3 font-sans">CLÍNICA ALFA DE TESTE LTDA</td>
                          <td className="py-2 px-3">22.222.222/2222-22</td>
                          <td className="py-2 px-3 font-sans text-slate-600">Maringá (fictício) • Laudos ilustrativos de demonstração</td>
                          <td className="py-2 px-3 text-right font-semibold">3.120,00</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-sans font-semibold">Recebida</span></td>
                          <td className="py-2 px-3 font-semibold">DEMO-R01</td>
                          <td className="py-2 px-3">03/09/2026</td>
                          <td className="py-2 px-3 font-sans">FORNECEDORA NUVEM DE TESTE LTDA</td>
                          <td className="py-2 px-3">44.444.444/4444-44</td>
                          <td className="py-2 px-3 font-sans text-slate-600">Toledo (fictício) • Suporte técnico demonstrativo</td>
                          <td className="py-2 px-3 text-right font-semibold">640,00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 bg-slate-100">
                {/* Modelo de Demonstração do DANFSe em PDF */}
                <div className="max-w-3xl mx-auto bg-white border border-slate-300 rounded-lg shadow-sm p-6 text-xs text-slate-800 space-y-4">
                  <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm uppercase tracking-tight text-slate-900">
                        DANFSe v2.0 — Documento Auxiliar da NFS-e (Modelo de Demonstração)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Exemplo de DANFSe com o mesmo layout de grade gerado pelo programa — Sem valor fiscal
                      </div>
                    </div>
                    <div className="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 font-mono text-[11px] text-right">
                      <div><strong>NFS-e Nº:</strong> 000000</div>
                      <div><strong>Competência:</strong> 15/04/2099</div>
                      <div><strong>Finalidade:</strong> Demonstração</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 font-mono text-[10.5px] text-slate-600 break-all">
                    <strong className="text-slate-800">CHAVE DE ACESSO DA NFS-E (FICTÍCIA):</strong> 00000000000000000000000000000000000000000000000000
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Prestador / Fornecedor (Fictício)</div>
                      <div className="font-bold text-slate-900">EMPRESA FICTÍCIA ALFA LTDA</div>
                      <div className="text-[11px] text-slate-600">CNPJ: 00.000.000/0000-00 • Tel: (00) 0000-0000</div>
                      <div className="text-[11px] text-slate-500">Município: Cidade Exemplo / ZZ • Rua de Teste, 123</div>
                    </div>
                    <div className="border border-slate-200 rounded p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Tomador / Adquirente (Fictício)</div>
                      <div className="font-bold text-slate-900">CLÍNICA MODELO BETA LTDA</div>
                      <div className="text-[11px] text-slate-600">CNPJ: 11.111.111/1111-11</div>
                      <div className="text-[11px] text-slate-500">Município: Cidade Exemplo / ZZ • Avenida de Exemplo, 456</div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-3">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Descrição do Serviço (Demonstração)</div>
                    <div className="text-xs text-slate-700">
                      SERVIÇO FICTÍCIO DE DEMONSTRAÇÃO. Serviço de teste, quantidade 2. Valor total: R$ 123,45. Tributos ilustrativos.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px]">
                    <div>
                      <span className="block text-[10px] font-sans text-slate-500">Valor do Serviço</span>
                      <strong>R$ 123,45</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-sans text-slate-500">Alíquota ISS</span>
                      <strong>1,11%</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-sans text-slate-500">ISSQN Apurado</span>
                      <strong className="text-amber-700">R$ 1,11</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-sans text-slate-500">Total Retenções</span>
                      <strong>R$ 4,32</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-1 sm:pt-0">
                      <span className="block text-[10px] font-sans text-slate-500">Valor Líquido</span>
                      <strong className="text-emerald-700">R$ 112,34</strong>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded">
                      MOCKUP | DADOS FICTÍCIOS | SEM VALOR FISCAL
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Comparativo Operacional & Público-Alvo (Condensado sem repetir etapas) */}
      <section id="comparativo" className="py-14 sm:py-16 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Rotina de Fechamento Fiscal</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Antes vs. Agora no fechamento do mês
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Antes */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6">
              <div className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm mb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Rotina Manual no Portal Web
              </div>
              <ul className="space-y-3 text-slate-600 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Download nota por nota:</strong> Abrir cada NFS-e manualmente para baixar XML e PDF.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>CAPTCHAs frequentes:</strong> Interrupções constantes a cada consulta individual.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Cobrança de clientes:</strong> Aguardar o envio manual de arquivos fiscais no início do mês.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Conferência lenta:</strong> Cruzar manualmente ISS retido, tributado e notas canceladas.</span>
                </li>
              </ul>
            </div>

            {/* Depois */}
            <div className="rounded-2xl border border-teal-300 bg-teal-50/40 p-6 shadow-xs">
              <div className="inline-flex items-center gap-2 text-teal-800 font-bold text-sm mb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Com o NFSe Nacional Suite
              </div>
              <ul className="space-y-3 text-slate-700 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Coleta automatizada em lote:</strong> Baixa notas emitidas, tomadas e cancelamentos via API.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Sem CAPTCHA por nota:</strong> Conexão mTLS direta com o Ambiente de Dados Nacional (ADN).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Autonomia contábil:</strong> Consulte direto na fonte com Certificado A1 ou A3 instalado no Windows.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Planilha e DANFSes prontos:</strong> Quadro resumo de ISS por situação tributária ao final do lote.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Público-Alvo integrado de forma enxuta */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Escritórios de Contabilidade & BPOs</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  No fechamento do dia 1º ao dia 10, alterne rapidamente entre os certificados da carteira de clientes e gere pastas padronizadas por CNPJ e competência sem depender do envio manual do cliente.
                </p>
                <span className="text-[11px] font-semibold text-teal-700">✓ Suporte Multi-CNPJ ilimitado no plano contábil</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Empresas Prestadoras & Tomadoras</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  Mantenha a guarda local dos XMLs emitidos e recebidos, confira o faturamento mensal e envie o pacote fechado de notas e relatórios para a sua contabilidade em poucos cliques.
                </p>
                <span className="text-[11px] font-semibold text-teal-700">✓ Organização automática por competência e situação</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interface da Aplicação / Telas (Demonstração Visual) */}
      <section id="demonstracao" className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">O Produto em Ação</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interface pensada para produtividade fiscal
            </p>
            <p className="text-slate-600 text-sm mt-2.5">
              Alterne entre o aplicativo Desktop autônomo e a extensão integrada para o Google Chrome.
            </p>

            {/* Aviso claro de dados fictícios */}
            <div className="mt-3.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                <span>ℹ️ Demonstração com dados fictícios: empresa, CNPJ e total de notas exibidos abaixo são ilustrativos.</span>
              </span>
            </div>

            {/* Alternador de Mockup Desktop / Extensão: 50%/50% confortável no mobile */}
            <div className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300 mt-5">
              <button
                type="button"
                onClick={() => setMockupTab('desktop')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
                  mockupTab === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="sm:hidden">App Desktop</span>
                <span className="hidden sm:inline">Aplicativo Desktop (Windows)</span>
              </button>
              <button
                type="button"
                onClick={() => setMockupTab('extension')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
                  mockupTab === 'extension'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="sm:hidden">Extensão Chrome</span>
                <span className="hidden sm:inline">Extensão Google Chrome (Side Panel)</span>
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
                  <span className="text-slate-700 font-medium">DANFSe em PDF Agrupado do Mês</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Certificados A1 e A3 via Windows Certificate Store</span>
                </div>
              </div>
            </div>
          )}

          {/* MOCKUP 2: CHROME EXTENSION SIDE PANEL */}
          {mockupTab === 'extension' && (
            <div className="relative mx-auto max-w-5xl transition-all duration-300">
              {/* Explicação explícita de como a Extensão funciona com o Native Host e ordem de instalação */}
              <div className="mb-5 bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <strong className="text-blue-900">Como usar a Extensão no Chrome (Suporte A1 e A3):</strong>{' '}
                  A extensão se comunica localmente com o componente <em>Native Host</em> no Windows para acessar seus certificados A1/A3 com segurança.{' '}
                  <strong>Ordem recomendada:</strong> 1º Instale o Aplicativo/Host para Windows (.exe) e 2º Adicione a Extensão na Chrome Web Store.
                </div>
                <a
                  href={downloadUrl}
                  download={`NFSe_Nacional_Suite_Setup_${appVersion}.exe`}
                  onClick={() => trackEvent('download_click', { version: appVersion, source: 'extension_step' })}
                  className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 min-h-[40px] rounded-lg text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>1º Baixar Host (.exe)</span>
                </a>
              </div>

              {/* Chrome Browser Window Frame */}
              <div className="rounded-2xl border border-slate-300 bg-slate-900/5 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
                <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                  {/* Chrome Browser Tab Bar */}
                  <div className="h-10 bg-slate-200 border-b border-slate-300 px-3 flex items-center justify-between select-none">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {/* Active Tab */}
                      <div className="bg-white px-3 py-1.5 rounded-t-lg border-t-2 border-teal-500 flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-xs truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">Portal da NFS-e Nacional</span>
                        <span className="text-[10px] text-slate-400 ml-1">✕</span>
                      </div>
                      {/* Inactive Tab */}
                      <div className="hidden sm:flex px-3 py-1.5 text-xs text-slate-500 items-center gap-2 hover:bg-slate-300/60 rounded-t-lg transition-colors">
                        <span>Receita Federal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                    </div>
                  </div>

                  {/* Chrome Omnibox / Address Bar */}
                  <div className="h-11 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 text-xs">
                    <div className="hidden sm:flex items-center gap-2 text-slate-400">
                      <span>←</span>
                      <span>→</span>
                      <span>↻</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-auto bg-slate-100 border border-slate-200 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2 text-slate-600 text-xs overflow-hidden">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-700 truncate">https://www.nfse.gov.br/portal/painel-contribuinte</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Pinned Extension Icon */}
                      <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 px-2 py-1 rounded-md text-[11px] font-bold">
                        <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="hidden sm:inline">NFSe-Bridge</span>
                      </div>
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

              {/* Floating Pill Callouts + Botão Direto para Web Store */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5">
                <a
                  href="https://chromewebstore.google.com/detail/oandcgniinidpminhdalfijhhfpbbonf"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto min-h-[42px] justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all hover:shadow"
                >
                  <Globe className="w-4 h-4 text-white shrink-0" />
                  <span>2º Instalar Extensão no Chrome (Web Store)</span>
                </a>
                <div className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Abre na barra lateral sem fechar a página de trabalho</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Transparência Técnica & Privacidade (O que fica local vs. O que sai do computador) */}
      <section id="seguranca" className="py-14 sm:py-16 bg-slate-900 text-white border-b border-slate-800 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-teal-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacidade e Transparência Técnica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              O que fica 100% no seu PC e o que é consultado externamente
            </h2>
            <p className="text-slate-400 text-sm mt-2.5 leading-relaxed">
              Transparência total em conformidade com a LGPD: saiba exatamente quais arquivos jamais saem da sua máquina e quais serviços externos o software consulta.
            </p>
          </div>

          {/* Quadro Comparativo: 100% Local vs Comunicações Externas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Coluna 1: O que fica 100% Local */}
            <div className="bg-slate-800/90 rounded-2xl border border-teal-500/40 p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-teal-400 font-bold text-sm mb-3">
                  <Lock className="w-4 h-4" />
                  <span>O que permanece 100% LOCAL no seu computador</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Não possuímos servidores em nuvem para armazenar, ler ou intermediar seus documentos fiscais. Ficam exclusivamente na sua máquina:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 mb-5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Chaves privadas dos Certificados A1 e A3:</strong> Protegidas pelo <em>Windows Certificate Store</em>; nunca são exportadas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Arquivos XML das NFS-e:</strong> Todo o conteúdo das notas é salvo direto na pasta escolhida no seu disco.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>PDFs de DANFSe e Planilhas Excel:</strong> Gerados localmente pelo motor fiscal na sua máquina.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Tolerância offline de até 72h garantida em contrato</span>
                <a
                  href="./eula.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Ler EULA</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Coluna 2: O que sai do computador e para quais serviços */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm mb-3">
                  <Globe className="w-4 h-4" />
                  <span>O que é comunicado externamente e para quais serviços</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  O software realiza apenas conexões estritamente necessárias para baixar as notas, enriquecer relatórios e validar sua licença:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span><strong>API Oficial ADN (Receita Federal / SERPRO):</strong> Conexão direta mTLS entre o seu PC e <code>adn.nfse.gov.br</code> para baixar os lotes de XML.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span><strong>BrasilAPI (Consulta Pública de CNPJ):</strong> Envia apenas os 14 dígitos públicos do CNPJ a <code>brasilapi.com.br</code> para preencher Razão Social e regime tributário nos relatórios.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span><strong>Google OAuth / Supabase e GitHub:</strong> Envia apenas seu e-mail de login, hash da máquina e versão instalada para validar a licença e buscar atualizações. <strong>Nenhum XML é enviado.</strong></span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Mapeamento completo das rotas de rede (LGPD)</span>
                <a
                  href="./privacidade.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Política de Privacidade</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 text-center max-w-3xl mx-auto">
            <strong>Nota de Independência:</strong> O NFSe Nacional Suite é um software de produtividade independente que atua como conector à API do Ambiente de Dados Nacional (ADN NT 008/2026). Não possui vínculo ou endosso institucional da Receita Federal do Brasil.
          </div>
        </div>
      </section>

      {/* 8. Download, Ordem de Instalação e Planos Comerciais */}
      <section id="download" className="py-14 sm:py-16 bg-slate-100 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-3">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Download Direto & Planos Transparentes</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Comece seu teste grátis de 15 dias agora
            </h2>
            <p className="text-slate-600 text-sm">
              Baixe o instalador para Windows, entre com sua conta Google para ativar os 15 dias gratuitos (sem cartão de crédito) e valide no seu próprio fechamento fiscal.
            </p>
          </div>

          {/* Cards de Instalação (Ordem 1º e 2º Passo explícita) */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            
            {/* Card 1: Aplicativo Desktop + Native Host */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-teal-500/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">1º Passo: Suíte Desktop + Native Host</h3>
                      <p className="text-xs text-slate-500">Versão v{appVersion} para Windows 10/11 (64-bit)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    Essencial
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Para usar apenas no Desktop (100% autônomo) ou como base obrigatória para a extensão do Chrome. Instala o programa e registra automaticamente o componente <em>Native Host</em> no Windows.
                </p>

                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Instalador `.exe` direto (22 MB — Inno Setup)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Compatível com Certificados Digitais A1 e A3 no Windows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Inclui Aplicativo Desktop + Registro do Native Host</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href={downloadUrl}
                  download={`NFSe_Nacional_Suite_Setup_${appVersion}.exe`}
                  onClick={() => trackEvent('download_click', { version: appVersion, source: 'desktop_card' })}
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Baixar Instalador Desktop (.exe)</span>
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Download direto v{appVersion} • Windows 10 e 11
                </p>
              </div>
            </div>

            {/* Card 2: Extensão Chrome */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">2º Passo (Opcional): Extensão Chrome</h3>
                      <p className="text-xs text-slate-500">Painel Lateral (Side Panel) no Navegador</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                    Complementar
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Para quem prefere operar direto na barra lateral do Google Chrome enquanto navega pelo portal `nfse.gov.br`. Requer o instalador do 1º Passo ativo no Windows.
                </p>

                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Integrada à barra lateral nativa do Google Chrome</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Compatível com certificados A1 e A3 via Native Host local</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Mesma conta e licença compartilhada com o Desktop</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href="https://chromewebstore.google.com/detail/oandcgniinidpminhdalfijhhfpbbonf"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm hover:shadow"
                >
                  <Globe className="w-4 h-4 text-white shrink-0" />
                  <span>Instalar no Chrome (Web Store)</span>
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Requer o instalador do 1º Passo ativo no Windows.
                </p>
              </div>
            </div>

          </div>

          {/* Informações Comerciais: Alinhadas com o EULA (Teste sem cobrança automática vs Renovação de planos pagos) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-7">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Transparência Comercial
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Como funcionam o teste gratuito e a assinatura dos planos
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                <strong>O teste de 15 dias não gera cobrança automática:</strong> você avalia apenas com seu login Google, sem cadastrar cartão de crédito. Somente se decidir contratar um plano pago após o teste, a assinatura passa a ter renovação automática mensal (cancelável a qualquer momento, sem multa).
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {/* Card Teste Grátis */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500 mb-1">Avaliação Inicial</div>
                  <div className="text-xl font-extrabold text-slate-900 mb-1">15 Dias Grátis</div>
                  <div className="text-xs text-teal-700 font-semibold mb-4">Sem cartão • Sem cobrança automática</div>
                  <ul className="text-xs text-slate-600 space-y-2 mb-4">
                    <li>• Ativação imediata via login Google no app ou extensão</li>
                    <li>• Acesso completo (incluindo teste com múltiplos CNPJs)</li>
                    <li>• Ao fim dos 15 dias, o teste encerra sem qualquer cobrança</li>
                    <li>• Todos os arquivos já baixados continuam 100% livres no seu PC</li>
                  </ul>
                </div>
                <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-200">
                  Para continuar realizando novas coletas após os 15 dias, basta contratar um dos planos ao lado.
                </div>
              </div>

              {/* Plano Pro Individual */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-teal-700 mb-1">Empresa Única</div>
                  <div className="text-xl font-extrabold text-slate-900 mb-1">Plano Pro Individual</div>
                  <div className="text-lg font-bold text-slate-800 mb-4">
                    R$ 49<span className="text-xs font-normal text-slate-500">/mês</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 mb-4">
                    <li>• <strong>1 CNPJ próprio</strong> (notas emitidas e tomadas da empresa)</li>
                    <li>• Instalação em até <strong>2 computadores</strong> da empresa</li>
                    <li>• Downloads em lote, DANFSe agrupado e Excel ilimitados</li>
                    <li>• Assinatura com renovação mensal; cancele quando quiser sem multa</li>
                  </ul>
                </div>
                <a
                  href="mailto:suporte.nfsebridge@gmail.com?subject=Assinatura%20Plano%20Pro%20Individual%20-%20NFSe%20Suite"
                  className="w-full min-h-[42px] inline-flex items-center justify-center text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 py-2.5 px-4 rounded-lg transition-colors"
                >
                  Contratar Pro Individual
                </a>
              </div>

              {/* Plano Escritório Contábil / Multi-CNPJ */}
              <div className="rounded-xl border-2 border-teal-600 bg-teal-50/20 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-teal-700">Escritórios & BPO</span>
                    <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">Mais escolhido</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mb-1">Plano Multi-CNPJ</div>
                  <div className="text-lg font-bold text-slate-800 mb-4">
                    R$ 129<span className="text-xs font-normal text-slate-500">/mês</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-2 mb-4">
                    <li>• <strong>CNPJs e certificados ilimitados</strong> da carteira de clientes</li>
                    <li>• Instalação em até <strong>5 computadores</strong> do escritório</li>
                    <li>• Uso liberado no Aplicativo Desktop e na Extensão Chrome</li>
                    <li>• Assinatura com renovação mensal; cancele quando quiser sem multa</li>
                  </ul>
                </div>
                <a
                  href="mailto:suporte.nfsebridge@gmail.com?subject=Assinatura%20Plano%20Multi-CNPJ%20Contabil%20-%20NFSe%20Suite"
                  className="w-full min-h-[42px] inline-flex items-center justify-center text-center text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 py-2.5 px-4 rounded-lg transition-colors"
                >
                  Contratar Multi-CNPJ
                </a>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 space-y-1">
              <div>
                <strong>Como funciona a renovação (Cláusula 8ª do <a href="./eula.html" target="_blank" rel="noreferrer" className="underline hover:text-slate-700">EULA</a>):</strong>{' '}
                Após a contratação voluntária de um plano pago, a assinatura renova-se automaticamente a cada ciclo (mensal ou anual) mediante pagamento e pode ser cancelada a qualquer momento antes do próximo vencimento, mantendo o acesso até o fim do período já pago.
              </div>
              <div>
                A licença é vinculada ao e-mail Google autenticado no programa. Atendimento comercial:{' '}
                <a href="mailto:suporte.nfsebridge@gmail.com" className="text-teal-700 font-semibold hover:underline">
                  suporte.nfsebridge@gmail.com
                </a>{' '}
                ou{' '}
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="text-teal-700 font-semibold hover:underline cursor-pointer"
                >
                  fale com um especialista via formulário
                </button>
                .
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ e Objeções (Perguntas Frequentes) */}
      <section id="faq" className="py-14 sm:py-16 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Tire suas dúvidas</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Perguntas Frequentes
            </p>
          </div>

          <div className="space-y-3.5">
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
                    className="w-full p-4 sm:p-5 text-left bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white text-xs text-slate-700 leading-relaxed border-t border-slate-100">
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
      <footer className="py-12 bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            
            {/* Marca no Footer */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 font-bold shrink-0">
                <FileCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">NFSe Nacional</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                  Suite
                </span>
              </div>
            </div>

            {/* Links Institucionais e Contato Oficial Documentado */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs text-slate-300">
              <a
                href="./privacidade.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="./termos.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Termos de Uso
              </a>
              <a
                href="./eula.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Contrato EULA
              </a>
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer text-slate-300"
              >
                Fale com um Especialista
              </button>
              <a
                href="mailto:suporte.nfsebridge@gmail.com"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <span>Contato: suporte.nfsebridge@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
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
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Banner de Consentimento de Cookies (LGPD) */}
      <CookieBanner />

      {/* Modal de Contato e Demonstração com Validação e Anti-Spam */}
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </div>
  );
}
