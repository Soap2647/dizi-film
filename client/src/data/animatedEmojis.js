// Google Noto Animated Emoji CDN
// URL: https://fonts.gstatic.com/s/e/notoemoji/latest/{hex}/512.gif
export const BASE_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest';

export const getUrl = (hex) => `${BASE_URL}/${hex}/512.gif`;

export const STICKER_GROUPS = [
  {
    label: '❤️ Sevgi',
    stickers: [
      { emoji: '🥰', hex: '1f970', label: 'Aşık' },
      { emoji: '😍', hex: '1f60d', label: 'Hayran' },
      { emoji: '😘', hex: '1f618', label: 'Öpücük' },
      { emoji: '💖', hex: '1f496', label: 'Kalp' },
      { emoji: '💕', hex: '1f495', label: 'Çift kalp' },
      { emoji: '❤️', hex: '2764_fe0f', label: 'Kırmızı kalp' },
      { emoji: '💋', hex: '1f48b', label: 'Öpücük izi' },
      { emoji: '🌹', hex: '1f339', label: 'Gül' },
    ],
  },
  {
    label: '😂 Komedi',
    stickers: [
      { emoji: '😂', hex: '1f602', label: 'Kahkaha' },
      { emoji: '🤣', hex: '1f923', label: 'Yuvarlandım' },
      { emoji: '😭', hex: '1f62d', label: 'Ağlıyorum' },
      { emoji: '😅', hex: '1f605', label: 'Mahcup' },
      { emoji: '🤭', hex: '1f92d', label: 'Sürpriz' },
      { emoji: '🫠', hex: '1fae0', label: 'Eriyorum' },
      { emoji: '😱', hex: '1f631', label: 'Şok' },
      { emoji: '🤯', hex: '1f92f', label: 'Beyin patladı' },
    ],
  },
  {
    label: '🎉 Kutlama',
    stickers: [
      { emoji: '🥳', hex: '1f973', label: 'Parti' },
      { emoji: '🎉', hex: '1f389', label: 'Kutlama' },
      { emoji: '✨', hex: '2728', label: 'Kıvılcım' },
      { emoji: '🔥', hex: '1f525', label: 'Ateş' },
      { emoji: '👏', hex: '1f44f', label: 'Alkış' },
      { emoji: '🙌', hex: '1f64c', label: 'Eller yukarı' },
      { emoji: '💪', hex: '1f4aa', label: 'Güçlü' },
      { emoji: '😎', hex: '1f60e', label: 'Havalı' },
    ],
  },
  {
    label: '🍿 Film',
    stickers: [
      { emoji: '🍿', hex: '1f37f', label: 'Patlamış mısır' },
      { emoji: '😀', hex: '1f600', label: 'Mutlu' },
      { emoji: '🦄', hex: '1f984', label: 'Unicorn' },
      { emoji: '🌈', hex: '1f308', label: 'Gökkuşağı' },
      { emoji: '⭐', hex: '2b50', label: 'Yıldız' },
      { emoji: '🎬', hex: '1f3ac', label: 'Klap' },
      { emoji: '👀', hex: '1f440', label: 'Gözler' },
      { emoji: '🤩', hex: '1f929', label: 'Büyülenmiş' },
    ],
  },
];
