/**
 * AudioService — تجريد الصوت في خطوتي
 *  - speakArabic(text): نطق النصوص التعليمية (Web Speech API) ويمكن استبداله بتسجيلات بشرية لاحقاً.
 *  - لا يُنطق أي نص قرآني آلياً: القرآن عبر ملفات صوتية حقيقية فقط.
 *  - الإعدادات: تشغيل/إيقاف الصوت، المؤثرات، سرعة النطق (بطيء/عادي).
 *  - لا يوجد Autoplay: كل تشغيل يبدأ بلمس/ضغط المستخدم.
 */
import { getEnvSound } from './library';
import { VOICE_FILES, RECORDED_COUNT, TOTAL_COUNT } from './voice-files';
import { voiceId } from './voice-hash';
import { speechText } from './text';
import { PHRASES, phraseById } from './phrases';

export interface AudioSettings {
  soundOn: boolean;
  effectsOn: boolean;
  rate: number; // 0.5 - 1.2
  quiet: boolean;
}

type Listener = (s: AudioSettings) => void;

const DEFAULT_SETTINGS: AudioSettings = { soundOn: true, effectsOn: true, rate: 0.85, quiet: false };

class AudioServiceImpl {
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private listeners = new Set<Listener>();
  private currentAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setSettings(patch: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...patch };
    if (!this.settings.soundOn) this.stop();
    this.listeners.forEach((l) => l(this.getSettings()));
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** هل يمكن تشغيل مؤثرات صوتية الآن؟ */
  private canPlayEffects() {
    return this.settings.soundOn && this.settings.effectsOn && !this.settings.quiet;
  }

  /**
   * نطق نص عربي (تعليمي عام فقط — لا قرآن).
   * الترتيب: تسجيل مسجّل مسبقاً (إن وُجد) ← محرّك نطق الجهاز ← صمت بلا تعطّل.
   */
  speak(text: string, opts: { rate?: number; force?: boolean } = {}) {
    if (!this.settings.soundOn && !opts.force) return;
    if (typeof window === 'undefined') return;
    if (!text?.trim()) return;

    // ١) تسجيل مسجّل (بشري أو مسبق) — يعمل بلا إنترنت ولا يحتاج محرّك نطق
    const recorded = VOICE_FILES[voiceId(text)];
    if (recorded) {
      this.stopAudio();
      try {
        const audio = new Audio(recorded);
        audio.preload = 'auto';
        // احترام تفضيل «سرعة النطق» حتى مع التسجيلات: البطيء يبطئ الملف بلا تغيير حدّة الصوت
        const rate = opts.rate ?? this.settings.rate;
        const target = rate < 0.8 ? 0.85 : 1;
        audio.playbackRate = target;
        if ('preservesPitch' in audio) (audio as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = true;
        this.currentAudio = audio;
        // إن تعذّر تشغيل الملف لأي سبب، نرجع إلى نطق الجهاز بهدوء
        audio.onerror = () => this.speakWithDevice(text, opts);
        void audio.play().catch(() => this.speakWithDevice(text, opts));
      } catch {
        this.speakWithDevice(text, opts);
      }
      return;
    }

    // ٢) نطق الجهاز
    this.speakWithDevice(text, opts);
  }

  /** نطق بمحرّك الجهاز فقط (يُستدعى كخطة بديلة أو عند غياب تسجيل) */
  /** يبحث عن صوت عربي على الجهاز (باللغة أو بالاسم) */
  private arabicVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    return (
      voices.find((v) => /^ar(\b|-|_)/i.test(v.lang ?? '')) ||
      voices.find((v) => /arab|عرب/i.test(v.name ?? ''))
    );
  }

  private speakWithDevice(text: string, opts: { rate?: number; force?: boolean } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    try {
      let voices = synth.getVoices?.() ?? [];

      // أصوات الجهاز تُحمَّل بعد لحظة من فتح الصفحة — ننتظرها مرّة واحدة
      if (voices.length === 0 && !opts.force) {
        const retry = () => this.speakWithDevice(text, { ...opts, force: true });
        try {
          synth.addEventListener?.('voiceschanged', retry, { once: true } as AddEventListenerOptions);
        } catch {
          /* متصفّح لا يدعم الحدث */
        }
        window.setTimeout(retry, 800);
        return;
      }

      const arabic = this.arabicVoice(voices);
      if (!arabic) {
        // لا صوت عربي على هذا الجهاز: لا ننطق نصاً عربياً بصوت أعجمي (كان يُسمع كلاماً غير مفهوم)
        try {
          window.dispatchEvent(new CustomEvent('khatwati:no-arabic-voice'));
        } catch {
          /* تجاهل */
        }
        return;
      }

      synth.cancel();
      // النطق من النص الموسَّع: «ﷺ» تُنطق كاملة «صلى الله عليه وسلم»، والأرقام تُنطق كلمات
      const u = new SpeechSynthesisUtterance(speechText(text));
      u.lang = arabic.lang || 'ar-SA';
      u.voice = arabic;
      u.rate = opts.rate ?? this.settings.rate;
      u.pitch = 1;
      u.volume = 1;
      synth.speak(u);
    } catch {
      /* تجاهل بصمت */
    }
  }

  stopSpeaking() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  }

  /** تشغيل صوت بيئة حقيقي (كلب، إسعاف، منبّه سيارة...) */
  playEnv(key: string) {
    const asset = getEnvSound(key);
    if (!asset) return;
    this.playUrl(asset.src);
  }

  /** تشغيل ملف صوتي (تلاوة قرآنية أو تسجيل بشري) */
  playUrl(src: string, opts: { loop?: boolean } = {}) {
    if (!this.settings.soundOn) return;
    this.stopAudio();
    try {
      const audio = new Audio(src);
      audio.loop = Boolean(opts.loop);
      audio.preload = 'auto';
      this.currentAudio = audio;
      void audio.play().catch(() => {
        /* يحتاج تفاعلاً من المستخدم — تجاهل بصمت */
      });
    } catch {
      /* تجاهل */
    }
  }

  pauseAudio() {
    this.currentAudio?.pause();
  }

  resumeAudio() {
    if (!this.settings.soundOn) return;
    void this.currentAudio?.play().catch(() => {});
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  stop() {
    this.stopSpeaking();
    this.stopAudio();
  }

  /** نغمة لطيفة هادئة (تغذية راجعة إيجابية) بلا أي صوت مفاجئ أو عالٍ */
  chime(kind: 'success' | 'soft' = 'success') {
    if (!this.canPlayEffects()) return;
    if (typeof window === 'undefined') return;
    try {
      this.ctx = this.ctx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const notes = kind === 'success' ? [523.25, 659.25] : [392.0];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0, now + i * 0.14);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.14 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.55);
      });
    } catch {
      /* تجاهل */
    }
  }

  /** نطق عبارة ثابتة بمعرّفها (تُسجَّل مرة واحدة وتُستعمل في كل الموقع) */
  say(phraseId: string) {
    const phrase = phraseById[phraseId];
    if (!phrase) return;
    this.speak(phrase.text);
  }

  /** عبارات تشجيع هادئة (بلا تكرار ممل) */
  praise() {
    const pool = PHRASES.filter((p) => p.id.startsWith('praise-'));
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (picked) this.speak(picked.text);
  }

  /** عند الإجابة غير الصحيحة: بلا صوت إنذار — فقط عبارة لطيفة */
  encourage() {
    this.say('try-again');
  }

  /** حالة التسجيلات الصوتية — تُعرض في الإعدادات للشفافية */
  voiceStatus() {
    return { recorded: RECORDED_COUNT, total: TOTAL_COUNT };
  }
}

export const audioService = new AudioServiceImpl();
export { RECORDED_COUNT, TOTAL_COUNT };
export const speakArabic = (text: string) => audioService.speak(text);
