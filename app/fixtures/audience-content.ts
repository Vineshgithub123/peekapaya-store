import type {Audience, AudienceContent} from '~/types/audience';
import boysHeroDesktop from '~/assets/images/boys-hero-desktop.png';
import boysHeroMobile from '~/assets/images/boys-hero-mobile.png';
import girlsHeroDesktop from '~/assets/images/girls-hero-desktop.png';
import girlsHeroMobile from '~/assets/images/girls-hero-mobile.png';

export const AUDIENCE_CONTENT: Record<Audience, AudienceContent> = {
  girls: {
    audience: 'girls',
    pageTitle: 'Girls clothing',
    heroDesktopImage: girlsHeroDesktop,
    heroMobileImage: girlsHeroMobile,
    heroAlt: 'Two children wearing Peekapaya outfits with the words Little Moments, Beautifully Styled',
    heroCollectionHandle: 'korean-collection',
    featuredTitle: 'Outfit of the week',
    featuredCollectionHandle: 'outfit-of-the-week',
    collectionHandle: 'girls',
    collectionHandles: ['korean-collection', 'party-picks'],
  },
  boys: {
    audience: 'boys',
    pageTitle: 'Boys clothing',
    heroDesktopImage: boysHeroDesktop,
    heroMobileImage: boysHeroMobile,
    heroAlt: 'Boys wearing Peekapaya outfits around the words Beautifully Styled',
    heroCollectionHandle: 'korean-collection-boys',
    featuredTitle: 'Curated Favorites',
    featuredCollectionHandle: 'curated-favorites',
    collectionHandle: 'boys',
    collectionHandles: ['korean-collection-boys', 'top-picks'],
  },
};
