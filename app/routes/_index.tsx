import {redirect} from 'react-router';
import type {Route} from './+types/_index';

export const meta: Route.MetaFunction = () => [{title: 'Peekapaya'}];

export async function loader(_: Route.LoaderArgs) {
  return redirect('/pages/girls', 302);
}

export default function HomepageRedirect() {
  return null;
}
