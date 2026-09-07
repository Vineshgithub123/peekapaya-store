import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.girls';
import {AUDIENCE_CONTENT} from '~/fixtures/audience-content';
import {AudienceLandingPage} from '~/pages/AudienceLandingPage';
import {
  AUDIENCE_LANDING_QUERY,
  getAudienceQueryVariables,
  normalizeAudienceData,
} from '~/services/audience';

export const meta: Route.MetaFunction = () => [
  {title: 'Girls Clothing | Peekapaya'},
  {name: 'description', content: 'Explore playful and comfortable girls clothing from Peekapaya.'},
];

export async function loader({context}: Route.LoaderArgs) {
  const content = AUDIENCE_CONTENT.girls;
  const data = await context.storefront.query(AUDIENCE_LANDING_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: getAudienceQueryVariables(content),
  });
  return normalizeAudienceData(data, content);
}

export default function GirlsPageRoute() {
  const data = useLoaderData<typeof loader>();
  return <AudienceLandingPage content={AUDIENCE_CONTENT.girls} {...data} />;
}
