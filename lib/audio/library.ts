/**
 * مكتبة الأصوات — خطوتي
 * أصوات البيئة: ملفات حقيقية مرخّصة من Wikimedia Commons (التفاصيل في data/audio-licenses.json).
 * القرآن: تلاوات صوتية حقيقية (لا تُقرأ آلياً إطلاقاً).
 */

export interface SoundAsset {
  key: string;
  src: string;
  label: string;
  credit: string;
  license: string;
}

export const ENV_SOUNDS: Record<string, SoundAsset> = {
  ambulance: {
    key: 'ambulance',
    src: '/audio/env/ambulance.wav',
    label: 'سيارة إسعاف',
    credit: 'Ambulance Sounds2.wav — Demircimehmed (Wikimedia Commons)',
    license: 'CC BY-SA 4.0',
  },
  'car-horn': {
    key: 'car-horn',
    src: '/audio/env/car-horn.wav',
    label: 'منبّه سيارة',
    credit: 'Car Horn.wav — 15HPanska_Ruttner_Jan (Freesound عبر Commons)',
    license: 'CC0',
  },
  plane: {
    key: 'plane',
    src: '/audio/env/plane.wav',
    label: 'طائرة',
    credit: 'inspectorj airplane-boeing-flyby — InspectorJ (Freesound عبر Commons)',
    license: 'CC BY 4.0',
  },
  dog: {
    key: 'dog',
    src: '/audio/env/dog.ogg',
    label: 'كلب',
    credit: 'Barking of a dog.ogg — Amada44 (Wikimedia Commons)',
    license: 'CC BY-SA 3.0',
  },
  cat: {
    key: 'cat',
    src: '/audio/env/cat.wav',
    label: 'قطة',
    credit: 'Meow of a Siamese cat — freemaster2 (Freesound عبر Commons)',
    license: 'CC0',
  },
  cow: {
    key: 'cow',
    src: '/audio/env/cow.ogg',
    label: 'بقرة',
    credit: 'Single Cow Moo.ogg — MichaeltheFox8621 (Wikimedia Commons)',
    license: 'CC BY-SA 4.0',
  },
  horse: {
    key: 'horse',
    src: '/audio/env/horse.ogg',
    label: 'حصان',
    credit: 'Wiehern.ogg — Hü (Wikimedia Commons)',
    license: 'ملكية عامة',
  },
  sheep: {
    key: 'sheep',
    src: '/audio/env/sheep.ogg',
    label: 'خروف',
    credit: 'Mudchute sheep 1.ogg — Secretlondon (Wikimedia Commons)',
    license: 'CC BY-SA 3.0',
  },
  rooster: {
    key: 'rooster',
    src: '/audio/env/rooster.ogg',
    label: 'ديك',
    credit: "Rooster crowing.ogg — Filo gèn' (Wikimedia Commons)",
    license: 'CC BY-SA 4.0',
  },
  birds: {
    key: 'birds',
    src: '/audio/env/birds.ogg',
    label: 'تغريد الطيور',
    credit: 'Birds singing in garden.ogg — ezwa (PDSounds عبر Commons)',
    license: 'ملكية عامة',
  },
};

/** أسماء السور المتوفرة كملفات صوتية حقيقية */
export const QURAN_SURAHS: { number: number; name: string }[] = [
  { number: 1, name: 'سورة الفاتحة' },
  { number: 94, name: 'سورة الشرح' },
  { number: 95, name: 'سورة التين' },
  { number: 97, name: 'سورة القدر' },
  { number: 99, name: 'سورة الزلزلة' },
  { number: 101, name: 'سورة القارعة' },
  { number: 102, name: 'سورة التكاثر' },
  { number: 103, name: 'سورة العصر' },
  { number: 105, name: 'سورة الفيل' },
  { number: 106, name: 'سورة قريش' },
  { number: 107, name: 'سورة الماعون' },
  { number: 108, name: 'سورة الكوثر' },
  { number: 109, name: 'سورة الكافرون' },
  { number: 110, name: 'سورة النصر' },
  { number: 111, name: 'سورة المسد' },
  { number: 112, name: 'سورة الإخلاص' },
  { number: 113, name: 'سورة الفلق' },
  { number: 114, name: 'سورة الناس' },
];

export const quranSrc = (n: number) => `/audio/quran/${n}.mp3`;

export const getEnvSound = (key: string): SoundAsset | undefined => ENV_SOUNDS[key];
