"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { useMemo, type ReactNode } from "react";

/**
 * Create an Apollo HttpLink.
 *
 * Uses "/graphql" (relative path) so requests go through
 * the Next.js rewrite proxy → same origin → cookies work.
 */
function createHttpLink() {
    return new HttpLink({
        uri: "/graphql",
        credentials: "same-origin",
        fetchOptions: { cache: "no-store" },
    });
}

/**
 * Create a fresh ApolloClient instance for client-side usage.
 */
function makeClient() {
    return new ApolloClient({
        link: from([createHttpLink()]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: { fetchPolicy: "cache-and-network" },
            query: { fetchPolicy: "network-only" },
        },
    });
}

/**
 * ApolloWrapper — Client Component provider that wraps the app
 * with ApolloProvider for client-side GraphQL operations.
 *
 * Usage in root layout:
 *   <ApolloWrapper>{children}</ApolloWrapper>
 */
export function ApolloWrapper({ children }: { children: ReactNode }) {
    const client = useMemo(() => makeClient(), []);

    return <ApolloProvider client={client}> {children} </ApolloProvider>;
}
