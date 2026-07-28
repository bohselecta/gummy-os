export const gummyRealmAssets = Object.freeze({
  realm: Object.freeze({
    id: 'lantern-chamber',
    expressions: Object.freeze({
      night: Object.freeze({
        desktop: '/brand/gummy/realm/lantern-chamber-night-1280x720.avif',
        desktopWebp: '/brand/gummy/realm/lantern-chamber-night-1280x720.webp',
        desktopLarge: '/brand/gummy/realm/lantern-chamber-night-1920x1080.avif',
        mobile: '/brand/gummy/realm/lantern-chamber-night-mobile-828x1472.avif',
        mobileWebp: '/brand/gummy/realm/lantern-chamber-night-mobile-828x1472.webp',
        preview: '/brand/gummy/realm/lantern-chamber-night-960x540.avif',
        lqip: '/brand/gummy/realm/lantern-chamber-night-lqip.webp'
      }),
      day: Object.freeze({
        desktop: '/brand/gummy/realm/lantern-chamber-day-1280x720.avif',
        desktopWebp: '/brand/gummy/realm/lantern-chamber-day-1280x720.webp',
        desktopLarge: '/brand/gummy/realm/lantern-chamber-day-1920x1080.avif',
        mobile: '/brand/gummy/realm/lantern-chamber-day-mobile-828x1472.avif',
        mobileWebp: '/brand/gummy/realm/lantern-chamber-day-mobile-828x1472.webp',
        preview: '/brand/gummy/realm/lantern-chamber-day-960x540.avif',
        lqip: '/brand/gummy/realm/lantern-chamber-day-lqip.webp'
      })
    })
  }),
  glopper: Object.freeze({
    standing: '/brand/gummy/actors/glopper-standing-three-quarter-512.webp',
    peeking: '/brand/gummy/actors/glopper-peeking-512.webp',
    chatBust: '/brand/gummy/actors/glopper-chat-bust-256.webp',
    avatar96: '/brand/gummy/actors/glopper-chat-bust-96.webp',
    avatar64: '/brand/gummy/actors/glopper-chat-bust-64.webp'
  }),
  portals: Object.freeze({
    glopper: '/brand/gummy/actors/glopper-portal-960x540.avif',
    imagehoss: '/brand/gummy/actors/imagehoss-portal-960x540.avif',
    videoboss: '/brand/gummy/actors/videoboss-portal-960x540.avif',
    meshmallow: '/brand/gummy/actors/meshmallow-portal-960x540.avif'
  }),
  productions: Object.freeze({
    launch: '/brand/gummy/productions/night-gummy-launch-1600x900.avif',
    launchSquare: '/brand/gummy/productions/night-gummy-launch-900x900.avif',
    untitled: '/brand/gummy/productions/untitled-production-1200x900.avif'
  }),
  social: Object.freeze({
    openGraph: '/brand/gummy/social/gummy-og-1200x630.webp',
    wide: '/brand/gummy/social/gummy-social-1200x675.webp',
    poster: '/brand/gummy/social/gummy-poster-1080x1350.webp'
  })
});

export function realmPicture(mode, { decorative = true, className = '' } = {}) {
  const safeMode = mode === 'day' ? 'day' : 'night';
  const assets = gummyRealmAssets.realm.expressions[safeMode];
  const picture = document.createElement('picture');
  if (className) picture.className = className;
  const mobile = document.createElement('source');
  mobile.media = '(max-width: 760px)';
  mobile.type = 'image/avif';
  mobile.srcset = assets.mobile;
  const desktop = document.createElement('source');
  desktop.type = 'image/avif';
  desktop.srcset = assets.desktop;
  const image = document.createElement('img');
  image.src = assets.desktopWebp;
  image.width = 1280;
  image.height = 720;
  image.decoding = 'async';
  image.alt = decorative ? '' : `${safeMode === 'day' ? 'Day' : 'Night'} Gummy Lantern Chamber`;
  if (decorative) image.setAttribute('aria-hidden', 'true');
  picture.append(mobile, desktop, image);
  return picture;
}
