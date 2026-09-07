import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.boys';
import {AUDIENCE_CONTENT} from '~/fixtures/audience-content';
import {AudienceLandingPage} from '~/pages/AudienceLandingPage';
import {
  AUDIENCE_LANDING_QUERY,
  getAudienceQueryVariables,
  normalizeAudienceData,
} from '~/services/audience';

export const meta: Route.MetaFunction = () => [
  {title: 'Boys Clothing | Peekapaya'},
  {name: 'description', content: 'Explore comfortable and expressive boys clothing from Peekapaya.'},
];

export async function loader({context}: Route.LoaderArgs) {
  const content = AUDIENCE_CONTENT.boys;
  const data = await context.storefront.query(AUDIENCE_LANDING_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: getAudienceQueryVariables(content),
  });
  return normalizeAudienceData(data, content);
}

export default function BoysPageRoute() {
  const data = useLoaderData<typeof loader>();
  return <AudienceLandingPage content={AUDIENCE_CONTENT.boys} {...data} />;
}
