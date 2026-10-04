const DATA_CLIENT_ROUTE = /^(?:\/amio-likhbo-bastobota(?:\/|$)|\/amio-likhbo-login(?:\/|$)|\/profile(?:\/|$)|\/admin(?:\/|$))/;

export function routeNeedsDataClient(location: string): boolean {
  return DATA_CLIENT_ROUTE.test(location);
}
