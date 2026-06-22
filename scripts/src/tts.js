/*
 * tts.js — Leitor em voz (bookmarklet) · código-fonte legível
 * ----------------------------------------------------------------
 * Versão legível e auditável do bookmarklet de leitura em voz.
 * O arquivo executável é ../tts-bookmarklet.js (este mesmo código,
 * minificado e prefixado com "javascript:").
 *
 * O que ele faz:
 *   - Cria um painel flutuante (Shadow DOM) na página atual.
 *   - Lê em voz alta o texto colado no painel.
 *   - Dois modos: "native" (SpeechSynthesis do navegador) e
 *     "elevenlabs" (vozes da API ElevenLabs, opcional).
 *
 * Configuração principal: o objeto CONFIG no topo (chunkSize, rate, modelo…).
 *
 * Segurança / chave de API:
 *   - A chave da ElevenLabs é OPCIONAL e fica apenas no seu navegador.
 *   - Ela é enviada diretamente para api.elevenlabs.io para gerar o áudio.
 *   - Trate-a como senha: não compartilhe nem suba para repositórios.
 *
 * Como gerar o bookmarklet a partir daqui:
 *   1. Minifique este arquivo (ex.: terser).
 *   2. Prefixe o resultado com "javascript:".
 *   3. Salve como conteúdo de um favorito.
 */

(() => {
  'use strict';

  /** Configuração central do leitor. */
  const CONFIG = {
    instanceKey: '__tts_reader__',
    native: {
      chunkSize: 1600,
      rate: 1.05,
    },
    eleven: {
      baseUrl: 'https://api.elevenlabs.io',
      model: 'eleven_multilingual_v2',
      chunkSize: 900,
      requestTimeoutMs: 45e3,
      voiceSettings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
    },
  };

  const MODE_NATIVE = 'native';
  const MODE_ELEVEN = 'elevenlabs';

  // Se o leitor já estiver aberto nesta página, apenas foca a instância.
  const existing = window[CONFIG.instanceKey];
  if (existing && typeof existing.focus === 'function') {
    existing.focus();
    return;
  }

  // ---------------------------------------------------------------------------
  // Utilitários
  // ---------------------------------------------------------------------------

  /** Limita `value` ao intervalo [min, max]. */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /** Normaliza texto para comparação: minúsculas, sem acentos, sem espaços nas pontas. */
  const normalizeForMatch = (value) =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD') // separa letra e acento (ex.: "á" -> "a" + combinante)
      .replace(/\p{Diacritic}/gu, '') // remove os acentos combinantes
      .trim();

  /**
   * Quebra o texto em pedaços de até `maxLength` caracteres, respeitando
   * parágrafos e pontuação sempre que possível.
   */
  function splitIntoChunks(text, maxLength) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return [];
    if (trimmed.length <= maxLength) return [trimmed];

    const paragraphs = trimmed
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const chunks = [];

    for (const paragraph of paragraphs) {
      const pieces = paragraph.match(/[^.!?;:]+[.!?;:]?|\S+/g) || [paragraph];
      let current = '';

      for (const piece of pieces) {
        const candidate = current ? `${current} ${piece}` : piece;
        if (candidate.length <= maxLength) {
          current = candidate;
        } else {
          if (current) {
            chunks.push(current);
            current = '';
          }
          if (piece.length <= maxLength) {
            current = piece;
          } else {
            for (let offset = 0; offset < piece.length; offset += maxLength) {
              chunks.push(piece.slice(offset, offset + maxLength));
            }
          }
        }
      }

      if (current) chunks.push(current);
    }

    return chunks.length ? chunks : [trimmed];
  }

  /** Nome amigável do navegador atual, usado no rótulo de status. */
  function detectBrowserName() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('edg/')) return 'Edge';
    if (userAgent.includes('chrome')) return 'Chrome';
    return 'Navegador';
  }

  const speech = window.speechSynthesis;
  const nativeSupported = !!speech && typeof window.SpeechSynthesisUtterance === 'function';

  // ---------------------------------------------------------------------------
  // Motor nativo (SpeechSynthesis do navegador)
  // ---------------------------------------------------------------------------

  class NativeSpeechEngine {
    getVoices() {
      try {
        return speech.getVoices() || [];
      } catch {
        return [];
      }
    }

    /** Pontua uma voz priorizando português (pt-BR) e vozes mais naturais. */
    scoreVoice(voice) {
      const name = normalizeForMatch(voice.name);
      const lang = normalizeForMatch(voice.lang);
      let score = 0;
      if (lang.startsWith('pt-br')) score += 120;
      if (lang.startsWith('pt')) score += 80;
      if (name.includes('google')) score += 20;
      if (name.includes('natural')) score += 20;
      return score;
    }

    pickVoice() {
      const voices = this.getVoices();
      if (!voices.length) return null;
      return [...voices].sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a))[0];
    }

    describe() {
      const voice = this.pickVoice();
      return `${detectBrowserName()} - ${voice ? voice.name : 'voz automática'}`;
    }

    /** Fala um pedaço e resolve com 'ended' ou 'error'. */
    speakChunk(text, voice, onStart) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = CONFIG.native.rate;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = voice?.lang || 'pt-BR';
        if (voice) utterance.voice = voice;

        let settled = false;
        const settle = (result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          resolve(result);
        };

        utterance.onstart = onStart;
        utterance.onend = () => settle('ended');
        utterance.onerror = () => settle('error');

        const timeoutId = setTimeout(() => settle('ended'), clamp(130 * text.length, 3e4, 18e4));

        try {
          speech.speak(utterance);
        } catch {
          settle('error');
        }
      });
    }

    async read(text, { onStatus }) {
      const voice = this.pickVoice();
      const chunks = splitIntoChunks(text, CONFIG.native.chunkSize);

      for (let index = 0; index < chunks.length; index += 1) {
        const counter = chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : '';
        const result = await this.speakChunk(chunks[index], voice, () =>
          onStatus(`Lendo${counter} com ${voice ? voice.name : 'voz padrão'}`)
        );
        if (result === 'error') {
          onStatus('Falha ao reproduzir no modo nativo');
          return 'error';
        }
      }

      return 'ok';
    }
  }

  // ---------------------------------------------------------------------------
  // Motor ElevenLabs (API externa, opcional)
  // ---------------------------------------------------------------------------

  class ElevenLabsEngine {
    constructor() {
      this.apiKey = '';
      this.voices = [];
      this.loadPromise = null;
    }

    setApiKey(value) {
      this.apiKey = String(value || '').trim();
      this.voices = [];
      this.loadPromise = null;
    }

    /** Reconhece a voz padrão "Sarah" usada por este leitor. */
    isDefaultVoice(voice) {
      const labels = voice?.labels || {};
      const haystack = normalizeForMatch(
        `${voice?.name || ''} ${labels.age || ''} ${labels.description || ''} ${voice?.description || ''}`
      );
      return (
        haystack.includes('sarah mature reassuring confident') ||
        normalizeForMatch(voice?.name) === 'sarah'
      );
    }

    /** Ordena alfabeticamente e coloca a voz padrão em primeiro, se houver. */
    sortVoices(voices) {
      const sorted = [...voices].sort((a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || ''))
      );
      const defaultIndex = sorted.findIndex((voice) => this.isDefaultVoice(voice));
      if (defaultIndex > 0) sorted.unshift(sorted.splice(defaultIndex, 1)[0]);
      return sorted;
    }

    pickVoice(voices = this.voices) {
      if (!voices.length) return null;
      return voices.find((voice) => this.isDefaultVoice(voice)) || voices[0];
    }

    describe() {
      const voice = this.pickVoice();
      return `ElevenLabs - ${voice ? voice.name : 'Sarah'}`;
    }

    /** Extrai uma mensagem de erro curta de uma resposta HTTP. */
    async parseHttpError(response) {
      const base = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        const message = data?.detail?.message || data?.detail || data?.message || data?.error;
        return message ? `${base} - ${String(message).slice(0, 80)}` : base;
      } catch {
        return base;
      }
    }

    async loadVoices({ onStatus = () => {}, force = false } = {}) {
      if (!this.apiKey) {
        onStatus('Informe a API key do ElevenLabs');
        return [];
      }
      if (!force && this.voices.length) return this.voices;
      if (this.loadPromise) return this.loadPromise;

      this.loadPromise = (async () => {
        onStatus('Buscando vozes...');
        const response = await fetch(`${CONFIG.eleven.baseUrl}/v2/voices?page_size=100`, {
          headers: { 'xi-api-key': this.apiKey },
        });
        if (!response.ok) {
          onStatus(`Falha ao carregar vozes (${await this.parseHttpError(response)})`);
          return [];
        }
        const data = await response.json();
        this.voices = this.sortVoices(Array.isArray(data?.voices) ? data.voices : []);
        onStatus(`${this.voices.length} vozes disponíveis`);
        return this.voices;
      })();

      try {
        return await this.loadPromise;
      } catch {
        onStatus('Erro ao carregar vozes');
        return [];
      } finally {
        this.loadPromise = null;
      }
    }

    /** Gera o áudio de um pedaço de texto e devolve o Blob (ou null em erro). */
    async requestAudio(text, voiceId, onStatus) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.eleven.requestTimeoutMs);
      try {
        const response = await fetch(
          `${CONFIG.eleven.baseUrl}/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': this.apiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text,
              model_id: CONFIG.eleven.model,
              voice_settings: CONFIG.eleven.voiceSettings,
            }),
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          onStatus(`Falha ElevenLabs (${await this.parseHttpError(response)})`);
          return null;
        }
        return await response.blob();
      } catch {
        onStatus('Erro de rede no ElevenLabs');
        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    /** Reproduz um Blob de áudio e resolve com 'ended' ou 'error'. */
    playAudio(blob, statusMessage, onStatus) {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.preload = 'auto';

        let settled = false;
        const settle = (result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          URL.revokeObjectURL(url);
          resolve(result);
        };

        audio.onended = () => settle('ended');
        audio.onerror = () => {
          onStatus('Falha ao reproduzir áudio ElevenLabs');
          settle('error');
        };

        const timeoutId = setTimeout(
          () => settle(audio.ended ? 'ended' : 'error'),
          clamp(blob.size / 2, 3e4, 18e4)
        );

        onStatus(statusMessage);
        const playback = audio.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(() => {
            onStatus('Falha ao iniciar áudio ElevenLabs');
            settle('error');
          });
        }
      });
    }

    async read(text, { onStatus }) {
      if (!this.apiKey) {
        onStatus('Informe a API key do ElevenLabs');
        return 'error';
      }

      const voices = this.voices.length ? this.voices : await this.loadVoices({ onStatus });
      if (!voices.length) {
        onStatus('Nenhuma voz elegível encontrada');
        return 'error';
      }

      const voice = this.pickVoice(voices);
      if (!voice?.voice_id) {
        onStatus('Voz Sarah não encontrada nesta conta');
        return 'error';
      }

      const chunks = splitIntoChunks(text, CONFIG.eleven.chunkSize);
      for (let index = 0; index < chunks.length; index += 1) {
        onStatus(`Gerando áudio ElevenLabs (${index + 1}/${chunks.length})`);
        const blob = await this.requestAudio(chunks[index], voice.voice_id, onStatus);
        if (!blob) return 'error';
        const counter = chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : '';
        const result = await this.playAudio(blob, `Reproduzindo${counter} com ${voice.name}`, onStatus);
        if (result !== 'ended') return result;
      }

      return 'ok';
    }
  }

  // ---------------------------------------------------------------------------
  // Arrastar o painel (com clique distinto do arrasto)
  // ---------------------------------------------------------------------------

  function makeDraggable({ handle, target, onClick }) {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button, input')) return;
      const rect = target.getBoundingClientRect();
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      originLeft = rect.left;
      originTop = rect.top;
      Object.assign(target.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        right: 'auto',
        bottom: 'auto',
      });
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {}
    });

    handle.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (!moved && Math.abs(deltaX) <= 3 && Math.abs(deltaY) <= 3) return;
      moved = true;
      const maxLeft = Math.max(8, window.innerWidth - target.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - target.offsetHeight - 8);
      target.style.left = `${clamp(originLeft + deltaX, 8, maxLeft)}px`;
      target.style.top = `${clamp(originTop + deltaY, 8, maxTop)}px`;
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {}
      if (!moved && onClick) onClick();
    };

    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  // ---------------------------------------------------------------------------
  // Aparência (Shadow DOM): fonte, estilos e marcação do painel
  // ---------------------------------------------------------------------------

  const FONT_STACK =
    'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  const STYLES = `
    :host, * { box-sizing: border-box; }

    .widget {
      width: 320px;
      color: #f5f7fb;
      font-family: ${FONT_STACK};
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    button, input, textarea {
      appearance: none;
      -webkit-appearance: none;
      border: 0;
      outline: none;
      font: inherit;
    }

    .panel {
      background: rgba(14, 15, 18, .96);
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, .34);
      backdrop-filter: blur(14px);
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 12px 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, .06);
      cursor: grab;
      user-select: none;
    }
    .header:active { cursor: grabbing; }

    .titles { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .title { font-size: 13px; font-weight: 700; letter-spacing: .02em; color: #fff; }
    .badge {
      font-size: 11px;
      color: rgba(255, 255, 255, .48);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-actions { display: flex; gap: 6px; margin-left: 10px; }
    .icon-btn {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, .05);
      color: rgba(255, 255, 255, .82);
      cursor: pointer;
      transition: background .16s, transform .16s, color .16s;
    }
    .icon-btn:hover { background: rgba(255, 255, 255, .1); transform: translateY(-1px); }

    .body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }

    .status {
      font-size: 11px;
      color: rgba(255, 255, 255, .52);
      line-height: 1.35;
      min-height: 16px;
    }

    .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mode-btn {
      height: 34px;
      border-radius: 10px;
      cursor: pointer;
      background: rgba(255, 255, 255, .05);
      color: rgba(255, 255, 255, .8);
      font-size: 12px;
      font-weight: 700;
      transition: background .16s, color .16s;
    }
    .mode-btn.active { background: #f3f4f6; color: #0d0f12; }

    .eleven-panel { display: flex; flex-direction: column; gap: 8px; }
    .eleven-panel[hidden] { display: none; }
    .field {
      height: 36px;
      border: 1px solid rgba(255, 255, 255, .07);
      border-radius: 10px;
      background: rgba(255, 255, 255, .045);
      color: #f5f7fb;
      padding: 0 11px;
      font-size: 12px;
    }
    .field::placeholder { color: rgba(255, 255, 255, .34); }

    .textarea {
      width: 100%;
      min-height: 124px;
      resize: none;
      border: 1px solid rgba(255, 255, 255, .07);
      border-radius: 14px;
      background: rgba(255, 255, 255, .045);
      color: #f5f7fb;
      padding: 14px 14px 13px;
      font: 500 14px/1.5 ${FONT_STACK};
      transition: border-color .16s, background .16s, box-shadow .16s;
    }
    .textarea::placeholder { color: rgba(255, 255, 255, .28); }
    .textarea:focus, .field:focus {
      background: rgba(255, 255, 255, .06);
      border-color: rgba(255, 255, 255, .14);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, .03);
    }

    .read-btn {
      height: 42px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      background: #f3f4f6;
      color: #0d0f12;
      transition: transform .16s, filter .16s, background .16s;
    }
    .read-btn:hover { transform: translateY(-1px); }

    .bubble {
      width: 52px;
      height: 52px;
      border-radius: 999px;
      background: rgba(14, 15, 18, .96);
      border: 1px solid rgba(255, 255, 255, .08);
      box-shadow: 0 20px 48px rgba(0, 0, 0, .28);
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      backdrop-filter: blur(14px);
    }
    .bubble span { font-size: 18px; line-height: 1; }

    .widget.minimized .panel { display: none; }
    .widget.minimized .bubble { display: flex; }
  `;

  const PANEL_HTML = `
    <div class="widget" id="widget">
      <div class="panel">
        <div class="header" id="header">
          <div class="titles">
            <div class="title">Leitor</div>
            <div class="badge" id="badge">Modo nativo</div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="minimize" title="Minimizar">_</button>
          </div>
        </div>
        <div class="body">
          <div class="status" id="status">Pronto</div>
          <div class="mode-grid">
            <button class="mode-btn active" id="mode-native">Nativo</button>
            <button class="mode-btn" id="mode-eleven">ElevenLabs</button>
          </div>
          <div class="eleven-panel" id="eleven-panel" hidden>
            <input class="field" id="api-key" type="password" autocomplete="off"
                   spellcheck="false" placeholder="API key ElevenLabs (opcional)">
          </div>
          <textarea class="textarea" id="text" placeholder="Cole o texto aqui..."></textarea>
          <button class="read-btn" id="read">Ler</button>
        </div>
      </div>
      <div class="bubble" id="bubble" title="Abrir"><span>*</span></div>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // Widget: monta o painel, liga eventos e orquestra os motores de leitura
  // ---------------------------------------------------------------------------

  class ReaderWidget {
    constructor() {
      this.mode = MODE_NATIVE;
      this.isReading = false;
      this.native = new NativeSpeechEngine();
      this.eleven = new ElevenLabsEngine();

      this.host = document.createElement('div');
      this.host.style.cssText =
        'position:fixed;right:24px;bottom:24px;left:auto;top:auto;z-index:2147483647';
      this.shadow = this.host.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `<style>${STYLES}</style>${PANEL_HTML}`;

      this.refs = {
        widget: this.byId('widget'),
        header: this.byId('header'),
        badge: this.byId('badge'),
        status: this.byId('status'),
        text: this.byId('text'),
        minimize: this.byId('minimize'),
        bubble: this.byId('bubble'),
        read: this.byId('read'),
        modeNative: this.byId('mode-native'),
        modeEleven: this.byId('mode-eleven'),
        elevenPanel: this.byId('eleven-panel'),
        apiKey: this.byId('api-key'),
      };
    }

    byId(id) {
      return this.shadow.getElementById(id);
    }

    setStatus(message) {
      this.refs.status.textContent = message;
    }

    currentEngine() {
      return this.mode === MODE_ELEVEN ? this.eleven : this.native;
    }

    updateBadge() {
      this.refs.badge.textContent = this.currentEngine().describe();
    }

    mount() {
      document.documentElement.append(this.host);
      this.bindEvents();
      this.setMode(MODE_NATIVE);
      if (!nativeSupported) this.setStatus('Modo nativo indisponível. Use ElevenLabs.');
    }

    bindEvents() {
      const { refs } = this;

      refs.read.addEventListener('click', () => this.startReading());
      refs.modeNative.addEventListener('click', () => this.setMode(MODE_NATIVE));
      refs.modeEleven.addEventListener('click', () => this.setMode(MODE_ELEVEN));
      refs.minimize.addEventListener('click', () => refs.widget.classList.add('minimized'));

      refs.apiKey.addEventListener('input', () => {
        this.eleven.setApiKey(refs.apiKey.value);
        this.updateBadge();
      });
      refs.apiKey.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        this.eleven
          .loadVoices({ onStatus: (message) => this.setStatus(message), force: true })
          .then(() => this.updateBadge());
      });

      makeDraggable({ handle: refs.header, target: this.host });
      makeDraggable({
        handle: refs.bubble,
        target: this.host,
        onClick: () => refs.widget.classList.remove('minimized'),
      });

      if (nativeSupported && typeof speech.addEventListener === 'function') {
        speech.addEventListener('voiceschanged', () => {
          if (this.mode === MODE_NATIVE) this.updateBadge();
        });
      }
    }

    setMode(mode) {
      this.mode = mode === MODE_ELEVEN ? MODE_ELEVEN : MODE_NATIVE;
      this.refs.modeNative.classList.toggle('active', this.mode === MODE_NATIVE);
      this.refs.modeEleven.classList.toggle('active', this.mode === MODE_ELEVEN);
      this.refs.elevenPanel.hidden = this.mode !== MODE_ELEVEN;
      this.updateBadge();
      if (this.mode === MODE_ELEVEN && this.eleven.apiKey && !this.eleven.voices.length) {
        this.eleven.loadVoices().then(() => this.updateBadge());
      }
    }

    async startReading() {
      if (this.isReading) {
        this.setStatus('Leitura em andamento');
        return;
      }

      const text = this.refs.text.value.trim();
      if (!text) {
        this.setStatus('Cole um texto primeiro');
        this.refs.text.focus();
        return;
      }

      if (this.mode !== MODE_NATIVE || nativeSupported) {
        this.isReading = true;
        this.setStatus('Preparando...');
        this.updateBadge();
        try {
          const result = await this.currentEngine().read(text, {
            onStatus: (message) => this.setStatus(message),
          });
          if (result === 'ok') this.setStatus('Concluído');
        } finally {
          this.isReading = false;
        }
      } else {
        this.setStatus('Modo nativo indisponível. Selecione ElevenLabs.');
      }
    }

    focus() {
      this.refs.widget.classList.remove('minimized');
      this.refs.text.focus({ preventScroll: true });
    }
  }

  const widget = new ReaderWidget();
  widget.mount();
  window[CONFIG.instanceKey] = widget;
})();
