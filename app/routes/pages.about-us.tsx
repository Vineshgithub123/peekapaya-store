import type {Route} from './+types/pages.about-us';
import {AboutPage} from '~/pages/AboutPage';

export const meta: Route.MetaFunction = () => [
  {title: 'About Us | Peekapaya'},
  {
    name: 'description',
    content:
      'Learn how Peekapaya selects joyful, comfortable kidswear for everyday adventures and special moments.',
  },
  {rel: 'canonical', href: '/pages/about-us'},
];

export default function AboutPageRoute() {
  return <AboutPage />;
}
