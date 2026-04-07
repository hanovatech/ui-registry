import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export function gotoParams(params: URLSearchParams) {
  // @ts-ignore resolve produces a valid URL but doesn't match SvelteKit's strict route literal types
  return goto(resolve(`${page.url.pathname}?${params.toString()}`));
}
