export type Audience = 'girls' | 'boys';

export interface AudienceContent {
  audience: Audience;
  pageTitle: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  heroAlt: string;
  heroCollectionHandle: string;
  featuredTitle: string;
  featuredCollectionHandle: string;
  collectionHandle: string;
  collectionHandles: readonly [string, string];
}
