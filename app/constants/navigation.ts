export const AUDIENCE_LINKS = [
  {label: 'Girls', to: '/pages/girls'},
  {label: 'Boys', to: '/pages/boys'},
] as const;

export const FALLBACK_NAVIGATION = [
  ...AUDIENCE_LINKS,
] as const;
