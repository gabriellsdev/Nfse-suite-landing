export default function SidePanelMockup() {
  return (
    <div className="sidepanel-container select-none">
      <style>{`
        .sidepanel-container {
          background-color: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          width: 100%;
        }

        .sidepanel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidepanel-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
          color: #1e40af;
        }

        .sidepanel-status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 5px;
          background-color: #dcfce7;
          color: #15803d;
        }

        .sidepanel-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #16a34a;
          display: inline-block;
        }

        .sidepanel-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .sidepanel-card-title {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidepanel-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidepanel-form-label {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
        }

        .sidepanel-select, .sidepanel-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          background-color: #fff;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
        }

        .sidepanel-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .sidepanel-radio-group, .sidepanel-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .sidepanel-option-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          cursor: pointer;
          color: #0f172a;
        }

        .sidepanel-option-label input[type="radio"],
        .sidepanel-option-label input[type="checkbox"] {
          margin: 0;
          accent-color: #2563eb;
        }

        .sidepanel-btn-sm {
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 4px;
          background-color: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          cursor: pointer;
        }

        .sidepanel-btn-primary {
          background-color: #1e40af;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .sidepanel-btn-select-folder {
          background-color: #e5edff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          height: 29px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .sidepanel-counter-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 8px;
          text-align: center;
        }

        .sidepanel-counter-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .sidepanel-counter-val-found {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2px;
        }

        .sidepanel-counter-val-downloaded {
          font-size: 22px;
          font-weight: 700;
          color: #059669;
          margin-top: 2px;
        }

        .sidepanel-status-msg {
          font-size: 11px;
          color: #334155;
          font-weight: 500;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 8px 10px;
          border-radius: 6px;
          word-break: break-word;
        }
      `}</style>

      {/* Header */}
      <div className="sidepanel-header">
        <div className="sidepanel-brand">
          <span>NFSe-Bridge</span>
        </div>
        <div className="sidepanel-status-badge">
          <span className="sidepanel-status-dot" />
          <span>Host Conectado</span>
        </div>
      </div>

      {/* Card 1: CERTIFICADO DIGITAL */}
      <div className="sidepanel-card">
        <div className="sidepanel-card-title">
          <span>CERTIFICADO DIGITAL (WINDOWS)</span>
          <button type="button" className="sidepanel-btn-sm" disabled>
            Atualizar
          </button>
        </div>
        <div className="sidepanel-form-group">
          <select className="sidepanel-select" defaultValue="none" disabled>
            <option value="none">Nenhum certificado detectado</option>
          </select>
        </div>
      </div>

      {/* Card 2: PERÍODO DE BUSCA */}
      <div className="sidepanel-card">
        <div className="sidepanel-card-title">
          <span>PERÍODO DE BUSCA</span>
        </div>

        <div className="sidepanel-radio-group">
          <label className="sidepanel-option-label">
            <input type="radio" name="mockup-side-filtro" defaultChecked disabled />
            <span>Competência</span>
          </label>
          <label className="sidepanel-option-label">
            <input type="radio" name="mockup-side-filtro" disabled />
            <span>Emissão</span>
          </label>
        </div>

        <div className="sidepanel-row">
          <div className="sidepanel-form-group flex-1">
            <label className="sidepanel-form-label">Mês Inicial (MM/AAAA)</label>
            <input type="text" className="sidepanel-input" value="10/2026" readOnly />
          </div>
          <div className="sidepanel-form-group flex-1">
            <label className="sidepanel-form-label">Mês Final (MM/AAAA)</label>
            <input type="text" className="sidepanel-input" value="10/2026" readOnly />
          </div>
        </div>

        <div className="sidepanel-row" style={{ marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Atalhos:</span>
          <button type="button" className="sidepanel-btn-sm" disabled>Mês Atual</button>
          <button type="button" className="sidepanel-btn-sm" disabled>Mês Anterior</button>
          <button type="button" className="sidepanel-btn-sm" disabled>Desde Jan</button>
        </div>
      </div>

      {/* Card 3: TIPO DE DOCUMENTO & OPÇÕES DE SAÍDA */}
      <div className="sidepanel-card">
        <div className="sidepanel-card-title">
          <span>TIPO DE DOCUMENTO & OPÇÕES DE SAÍDA</span>
        </div>

        <div className="sidepanel-radio-group">
          <label className="sidepanel-option-label">
            <input type="radio" name="mockup-side-tipo" defaultChecked disabled />
            <span>Emitidas</span>
          </label>
          <label className="sidepanel-option-label">
            <input type="radio" name="mockup-side-tipo" disabled />
            <span>Recebidas</span>
          </label>
          <label className="sidepanel-option-label">
            <input type="radio" name="mockup-side-tipo" disabled />
            <span>Todas</span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <label className="sidepanel-option-label">
            <input type="checkbox" defaultChecked disabled />
            <span>Gerar DANFSe agrupado automaticamente (PDF)</span>
          </label>
          <label className="sidepanel-option-label">
            <input type="checkbox" defaultChecked disabled />
            <span>Gerar Relatório de Serviços (PDF)</span>
          </label>
          <label className="sidepanel-option-label" style={{ fontWeight: 600 }}>
            <input type="checkbox" disabled />
            <span>Salvar cópia compactada dos XMLs (.zip)</span>
          </label>
          <label className="sidepanel-option-label">
            <input type="checkbox" defaultChecked disabled />
            <span>Gerar Relatório em Planilha Excel (.xlsx)</span>
          </label>
        </div>

        <div className="sidepanel-form-group" style={{ marginTop: '8px' }}>
          <label className="sidepanel-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
            Salvar Arquivos em:
          </label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              className="sidepanel-input"
              value="(Padrão: Documentos\NFSe-Bridge\Notas)"
              readOnly
              style={{ flex: 1, color: '#64748b' }}
            />
            <button type="button" className="sidepanel-btn-select-folder" disabled>
              Selecionar...
            </button>
          </div>
        </div>
      </div>

      {/* Botão de Ação */}
      <div>
        <button type="button" className="sidepanel-btn-primary" disabled>
          Baixar NFS-e via API ADN
        </button>
      </div>

      {/* Card 4: PROGRESSO DO DOWNLOAD */}
      <div className="sidepanel-card" style={{ gap: '10px' }}>
        <div className="sidepanel-card-title">
          <span>PROGRESSO DO DOWNLOAD</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="sidepanel-counter-box">
            <div className="sidepanel-counter-label">NOTAS ENCONTRADAS</div>
            <div className="sidepanel-counter-val-found">0</div>
          </div>

          <div className="sidepanel-counter-box">
            <div className="sidepanel-counter-label">NOTAS BAIXADAS</div>
            <div className="sidepanel-counter-val-downloaded">0</div>
          </div>
        </div>

        <div className="sidepanel-status-msg">
          <span>Pronto para iniciar busca</span>
        </div>
      </div>
    </div>
  );
}
