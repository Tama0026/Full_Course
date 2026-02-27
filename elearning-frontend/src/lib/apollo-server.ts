import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { cookies } from "next/headers";
import { GRAPHQL_ENDPOINT, ACCESS_TOKEN_COOKIE } from "@/lib/constants";

/**
 * Get an Apollo Client instance for Server Components.
 *
 * Each call creates a fresh client (no singleton caching) because
 * Server Components run on the server per-request.
 *
 * The access token is read from HttpOnly cookies and attached
 * as an Authorization header.
 *
 * Usage in a Server Component:
 *   const client = await getServerClient();
 *   const { data } = await client.query({ query: MY_QUERY });
 */
export async function getServerClient() {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    const httpLink = new HttpLink({
        uri: GRAPHQL_ENDPOINT,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        fetchOptions: { cache: "no-store" },
    });

    return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
        ssrMode: true,
        defaultOptions: {
            query: { fetchPolicy: "no-cache" },
        },
    });
}
