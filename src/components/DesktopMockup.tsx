export default function DesktopMockup() {
  return (
    <div className="w-full flex justify-center text-left select-none">
      <style>{`
        .mockup-desktop-window {
          --ink: #273344;
          --muted: #687486;
          --line: #d9dee7;
          --blue: #1761d1;
          --canvas: #f0f2f7;
          width: 100%;
          max-width: 860px;
          container-type: inline-size;
          background: var(--canvas);
          color: var(--ink);
          font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.35;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
          border: 1px solid #cbd5e1;
        }

        .mockup-titlebar {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 10px;
          background: #ffffff;
          color: #222;
          font-size: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .mockup-window-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 500;
        }

        .mockup-app-icon {
          width: 14px;
          height: 14px;
          border: 1px solid #8ba0bd;
          border-radius: 2px;
          background: linear-gradient(135deg, #eaf2ff 0 48%, #1e5fd0 49% 60%, #f8fbff 61%);
        }

        .mockup-window-controls {
          display: flex;
          height: 100%;
        }

        .mockup-window-controls span {
          width: 44px;
          display: grid;
          place-items: center;
          color: #475569;
          font-size: 14px;
          transition: background 0.15s;
        }

        .mockup-window-controls span:last-child {
          font-size: 16px;
        }

        .mockup-app-content {
          padding: 14px 16px 16px;
        }

        .mockup-top-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin: 0 2px 10px;
        }

        .mockup-h1 {
          margin: 0 0 4px;
          color: #1e293b;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 700;
        }

        .mockup-subtitle {
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 0.1px;
        }

        .mockup-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
          white-space: nowrap;
        }

        .mockup-text-action {
          font-size: 11px;
          font-weight: 600;
          color: #243248;
          cursor: pointer;
        }

        .mockup-version {
          padding: 5px 9px;
          color: #1555ad;
          font-size: 11px;
          font-weight: 700;
          background: #e1ebff;
          border-radius: 4px;
          border: 1px solid #bfdbfe;
        }

        .mockup-panel {
          padding: 0 12px 12px;
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 4px;
        }

        .mockup-panel-title {
          margin: 0 -12px 10px;
          padding: 6px 14px 6px;
          color: #1e293b;
          font-weight: 700;
          font-size: 12px;
          border-bottom: 1px solid #edf0f4;
          background: #fafbfc;
        }

        .mockup-field-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 6px;
        }

        .mockup-field-label {
          flex: 0 0 115px;
          font-weight: 700;
          white-space: nowrap;
          color: #334155;
          font-size: 12px;
        }

        .mockup-input, .mockup-select {
          height: 26px;
          padding: 3px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 3px;
          background: #ffffff;
          color: #1e293b;
          font-family: "Segoe UI", Arial, sans-serif;
          font-size: 12px;
          outline: none;
        }

        .mockup-select {
          min-width: 0;
          flex: 1;
          font-size: 11px;
        }

        .mockup-select-action {
          flex: 1;
          display: flex;
          gap: 7px;
          min-width: 0;
        }

        .mockup-small-button {
          min-height: 26px;
          padding: 3px 10px;
          border: 1px solid #cbd5e1;
          background: #e7efff;
          color: #1956ad;
          font-size: 11px;
          font-weight: 600;
          border-radius: 3px;
          white-space: nowrap;
          cursor: pointer;
        }

        .mockup-date-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin: 8px 6px;
        }

        .mockup-date-field {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .mockup-date-field .mockup-field-label {
          flex: 0 0 115px;
        }

        .mockup-date-field input {
          width: 88px;
        }

        .mockup-date-field.end {
          justify-content: flex-end;
        }

        .mockup-date-field.end .mockup-field-label {
          flex-basis: auto;
        }

        .mockup-quick-row {
          margin: 0 0 10px 127px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .mockup-quick-label {
          color: var(--muted);
          font-size: 11px;
          margin-right: 2px;
        }

        .mockup-quick-row .mockup-small-button {
          padding: 2px 10px;
          font-size: 11px;
        }

        .mockup-choice-row {
          display: flex;
          align-items: center;
          gap: 20px;
          min-height: 26px;
          margin: 6px 6px;
        }

        .mockup-choice-row > .mockup-field-label {
          flex: 0 0 115px;
        }

        .mockup-choice {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          font-size: 12px;
          color: #334155;
        }

        .mockup-choice input {
          margin: 0;
          accent-color: #1e5fd0;
        }

        .mockup-options-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 8px 18px;
          margin: 10px 6px 10px;
        }

        .mockup-path-row {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 8px 6px;
        }

        .mockup-path-row .mockup-field-label {
          flex: 0 0 115px;
        }

        .mockup-path-row input {
          flex: 1;
          min-width: 0;
        }

        .mockup-toolbar {
          display: flex;
          align-items: stretch;
          gap: 6px;
          margin: 12px 0 6px;
        }

        .mockup-toolbar-spacer {
          flex: 1;
        }

        .mockup-action-button {
          min-height: 38px;
          padding: 8px 12px;
          border: 0;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          border-radius: 3px;
          white-space: nowrap;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .mockup-toolbar {
          display: flex;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0 6px;
        }

        .mockup-download { min-width: 105px; flex: 1.2; background: #1e5fd0; }
        .mockup-danfse { min-width: 120px; flex: 1.35; background: #099d76; }
        .mockup-cancel { min-width: 80px; flex: 0.9; background: #dc3037; }
        .mockup-open { min-width: 95px; flex: 1; background: #64748b; font-weight: 600; }
        .mockup-folder { min-width: 100px; flex: 1.05; background: #64748b; font-weight: 600; font-size: 11px; }

        .mockup-reports {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .mockup-report {
          min-height: 34px;
          padding: 6px 10px;
          font-size: 11px;
          border-radius: 3px;
        }

        .mockup-report-issued { flex: 1.1; background: #0891b2; }
        .mockup-report-received { flex: 1.25; background: #7c3aed; }
        .mockup-report-excel { flex: 0.95; background: #15803d; }

        .mockup-status-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 28px;
          padding: 4px 10px;
          background: #e2e8f0;
          color: #1758b5;
          font-weight: 600;
          border-radius: 3px;
          font-size: 11px;
        }

        .mockup-status-line span:last-child {
          color: #64748b;
          font-weight: 400;
        }

        .mockup-progress-track {
          height: 18px;
          margin-top: 6px;
          border: 1px solid #cbd5e1;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }

        .mockup-progress-fill {
          width: 38px;
          height: 100%;
          background: linear-gradient(#e2e8f0, #cbd5e1);
          border-right: 1px solid #94a3b8;
        }

        .mockup-footer {
          margin: 18px 2px 0;
          color: #94a3b8;
          font-size: 11px;
        }

        @container (max-width: 680px) {
          .mockup-app-content { padding: 10px; }
          .mockup-top-header { flex-direction: column; gap: 8px; }
          .mockup-header-actions { padding-top: 0; flex-wrap: wrap; white-space: normal; gap: 6px; }
          .mockup-window-controls span { width: 30px; }
          .mockup-date-row { grid-template-columns: 1fr; gap: 6px; }
          .mockup-date-field.end { justify-content: flex-start; }
          .mockup-quick-row { margin-left: 0; flex-wrap: wrap; }
          .mockup-choice-row { flex-wrap: wrap; gap: 10px; padding: 4px 0; }
          .mockup-choice-row > .mockup-field-label { flex-basis: 100%; }
          .mockup-options-grid { grid-template-columns: 1fr; }
          .mockup-field-row, .mockup-path-row { align-items: flex-start; flex-wrap: wrap; }
          .mockup-field-label, .mockup-path-row .mockup-field-label, .mockup-date-field .mockup-field-label { flex-basis: 100%; }
          .mockup-select-action { flex-basis: 100%; flex-wrap: wrap; }
          .mockup-path-row input { flex-basis: calc(100% - 90px); }
          .mockup-toolbar, .mockup-reports { flex-wrap: wrap; }
          .mockup-toolbar-spacer { display: none; }
          .mockup-action-button { flex: 1 1 45%; }
          .mockup-report { flex: 1 1 100%; }
          .mockup-status-line { flex-wrap: wrap; gap: 4px; }
        }

        @media (max-width: 680px) {
          .mockup-app-content { padding: 10px; }
          .mockup-top-header { flex-direction: column; gap: 8px; }
          .mockup-header-actions { padding-top: 0; flex-wrap: wrap; white-space: normal; gap: 6px; }
          .mockup-window-controls span { width: 30px; }
          .mockup-date-row { grid-template-columns: 1fr; gap: 6px; }
          .mockup-date-field.end { justify-content: flex-start; }
          .mockup-quick-row { margin-left: 0; flex-wrap: wrap; }
          .mockup-choice-row { flex-wrap: wrap; gap: 10px; padding: 4px 0; }
          .mockup-choice-row > .mockup-field-label { flex-basis: 100%; }
          .mockup-options-grid { grid-template-columns: 1fr; }
          .mockup-field-row, .mockup-path-row { align-items: flex-start; flex-wrap: wrap; }
          .mockup-field-label, .mockup-path-row .mockup-field-label, .mockup-date-field .mockup-field-label { flex-basis: 100%; }
          .mockup-select-action { flex-basis: 100%; flex-wrap: wrap; }
          .mockup-path-row input { flex-basis: calc(100% - 90px); }
          .mockup-toolbar, .mockup-reports { flex-wrap: wrap; }
          .mockup-toolbar-spacer { display: none; }
          .mockup-action-button { flex: 1 1 45%; }
          .mockup-report { flex: 1 1 100%; }
          .mockup-status-line { flex-wrap: wrap; gap: 4px; }
        }
      `}</style>

      <div className="mockup-desktop-window">
        {/* Windows Title Bar */}
        <div className="mockup-titlebar">
          <div className="mockup-window-title">
            <span className="mockup-app-icon" aria-hidden="true"></span>
            <span>NFS-e Nacional (v1.4.5)</span>
          </div>
          <div className="mockup-window-controls" aria-hidden="true">
            <span>—</span>
            <span>□</span>
            <span className="hover:bg-red-500 hover:text-white">×</span>
          </div>
        </div>

        {/* Application Content */}
        <div className="mockup-app-content">
          <header className="mockup-top-header">
            <div>
              <h1 className="mockup-h1">NFS-e Nacional</h1>
              <div className="mockup-subtitle">
                Conector Independente ADN&nbsp; • &nbsp;DANFSe&nbsp; • &nbsp;Relatórios de Serviços&nbsp; • &nbsp;Excel
              </div>
            </div>
            <div className="mockup-header-actions">
              <span className="mockup-text-action" style={{ color: '#64748b', fontWeight: 500 }}>Demonstração (dados fictícios)</span>
              <span className="mockup-version">▧ v1.4.5 (Atualizações)</span>
            </div>
          </header>

          <section className="mockup-panel" aria-label="Parâmetros da Consulta">
            <div className="mockup-panel-title">Parâmetros da Consulta</div>

            <div className="mockup-field-row">
              <label className="mockup-field-label">Certificado Digital:</label>
              <div className="mockup-select-action">
                <select className="mockup-select" disabled>
                  <option>EMPRESA EXEMPLO CONTABIL LTDA:00123456000199 (válido até 15/12/2027)</option>
                </select>
                <button className="mockup-small-button" type="button" disabled>▧ Recarregar</button>
              </div>
            </div>

            <div className="mockup-date-row">
              <div className="mockup-date-field">
                <label className="mockup-field-label">Data Início:</label>
                <input className="mockup-input" type="text" value="01/10/2026" readOnly />
              </div>
              <div className="mockup-date-field end">
                <label className="mockup-field-label">Data Fim:</label>
                <input className="mockup-input" type="text" value="14/10/2026" readOnly />
              </div>
            </div>

            <div className="mockup-quick-row">
              <span className="mockup-quick-label">Período rápido:</span>
              <button className="mockup-small-button" type="button" disabled>Hoje</button>
              <button className="mockup-small-button" type="button" disabled>7 dias</button>
              <button className="mockup-small-button" type="button" disabled>Mês atual</button>
              <button className="mockup-small-button" type="button" disabled>Mês anterior</button>
            </div>

            <div className="mockup-choice-row">
              <span className="mockup-field-label">Tipo de Nota:</span>
              <label className="mockup-choice">
                <input type="radio" name="mockup-tipo" defaultChecked disabled /> Emitidas
              </label>
              <label className="mockup-choice">
                <input type="radio" name="mockup-tipo" disabled /> Recebidas
              </label>
              <label className="mockup-choice">
                <input type="radio" name="mockup-tipo" disabled /> Todas
              </label>
            </div>

            <div className="mockup-choice-row">
              <span className="mockup-field-label">Filtro de Data:</span>
              <label className="mockup-choice">
                <input type="radio" name="mockup-data" defaultChecked disabled /> Emissão
              </label>
              <label className="mockup-choice">
                <input type="radio" name="mockup-data" disabled /> Competência
              </label>
            </div>

            <div className="mockup-options-grid">
              <label className="mockup-choice">
                <input type="checkbox" defaultChecked disabled />
                <span>Gerar DANFSe agrupado automaticamente (PDF)</span>
              </label>
              <label className="mockup-choice">
                <input type="checkbox" defaultChecked disabled />
                <span>Gerar Relatório de Serviços (PDF)</span>
              </label>
              <label className="mockup-choice">
                <input type="checkbox" disabled />
                <span><strong>Salvar cópia compactada dos XMLs (.zip)</strong></span>
              </label>
              <label className="mockup-choice">
                <input type="checkbox" defaultChecked disabled />
                <span>Gerar Relatório em Planilha Excel (.xlsx)</span>
              </label>
            </div>

            <div className="mockup-path-row">
              <label className="mockup-field-label">Pasta dos XMLs:</label>
              <input className="mockup-input" type="text" value="C:\NFSe_Nacional\xmls_baixados" readOnly />
              <button className="mockup-small-button" type="button" disabled>Selecionar...</button>
            </div>

            <div className="mockup-path-row">
              <label className="mockup-field-label">Salvar Arquivos em:</label>
              <input className="mockup-input" type="text" value="C:\NFSe_Nacional" readOnly />
              <button className="mockup-small-button" type="button" disabled>Selecionar...</button>
            </div>
          </section>

          {/* Action Toolbar */}
          <div className="mockup-toolbar">
            <button className="mockup-action-button mockup-download" type="button" disabled>
              <span>⬇</span> Baixar Notas
            </button>
            <button className="mockup-action-button mockup-danfse" type="button" disabled>
              <span>▤</span> DANFSe (PDF)
            </button>
            <button className="mockup-action-button mockup-cancel" type="button" disabled>
              <span>×</span> Cancelar
            </button>
            <span className="mockup-toolbar-spacer"></span>
            <button className="mockup-action-button mockup-open" type="button" disabled>
              <span>⌕</span> Abrir DANFSe
            </button>
            <button className="mockup-action-button mockup-folder" type="button" disabled>
              <span>▱</span> Pasta de Saída
            </button>
          </div>

          {/* Reports Toolbar */}
          <div className="mockup-reports">
            <button className="mockup-action-button mockup-report mockup-report-issued" type="button" disabled>
              <span>▣</span> Relatório Serviços Prestados (Emitidas)
            </button>
            <button className="mockup-action-button mockup-report mockup-report-received" type="button" disabled>
              <span>♟</span> Relatório Serviços Tomados (Recebidas)
            </button>
            <button className="mockup-action-button mockup-report mockup-report-excel" type="button" disabled>
              <span>▧</span> Relatório Excel (.xlsx)
            </button>
          </div>

          {/* Status Line & Progress */}
          <div className="mockup-status-line">
            <span>Pronto. 136 nota(s) processada(s).</span>
            <span>Arquivos salvos com sucesso</span>
          </div>
          <div className="mockup-progress-track">
            <div className="mockup-progress-fill"></div>
          </div>

          <footer className="mockup-footer">
            © 2026 Gabriel Vinicius — NFS-e Nacional Suite
          </footer>
        </div>
      </div>
    </div>
  );
}
