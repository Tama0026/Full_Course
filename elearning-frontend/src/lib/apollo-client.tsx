"use client";

import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
    Observable,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useMemo, type ReactNode } from "react";

/** Track in-flight refresh to avoid concurrent refresh requests */
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function resolvePendingRequests() {
    pendingRequests.forEach((resolve) => resolve());
    pendingRequests = [];
}

/**
 * Calls /api/auth/refresh to get new tokens.
 * Returns true on success, false on failure.
 */
async function refreshTokens(): Promise<boolean> {
    try {
        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "same-origin",
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Create an Apollo HttpLink.
 */
function createHttpLink() {
    return new HttpLink({
        uri: "/graphql",
        credentials: "same-origin",
        fetchOptions: { cache: "no-store" },
    });
}

/**
 * Error link: intercepts UNAUTHENTICATED errors and attempts
 * a silent token refresh before retrying the failed operation.
 * If refresh fails, redirects to /login.
 */
function createErrorLink() {
    return new ErrorLink(({ error, operation, forward }) => {
        // Check if this is a GraphQL UNAUTHENTICATED error (Apollo v16 API)
        const isUnauthenticated =
            CombinedGraphQLErrors.is(error) &&
            error.errors.some(
                (err) => err.extensions?.code === "UNAUTHENTICATED"
            );

        if (!isUnauthenticated) return;

        return new Observable((subscriber) => {
            const tryRefresh = async () => {
                if (!isRefreshing) {
                    isRefreshing = true;
                    const success = await refreshTokens();

                    if (success) {
                        isRefreshing = false;
                        resolvePendingRequests();
                    } else {
                        isRefreshing = false;
                        pendingRequests = [];
                        window.location.href = "/login";
                        subscriber.error(new Error("Session expired"));
                        return;
                    }
                } else {
                    // Queue this request while refresh is in flight
                    await new Promise<void>((resolve) => {
                        pendingRequests.push(resolve);
                    });
                }

                // Retry the original operation
                const sub = forward(operation).subscribe({
                    next: subscriber.next.bind(subscriber),
                    error: subscriber.error.bind(subscriber),
                    complete: subscriber.complete.bind(subscriber),
                });

                return () => sub.unsubscribe();
            };

            tryRefresh();
        });
    });
}

/**
 * Create a fresh ApolloClient instance for client-side usage.
 */
function makeClient() {
    return new ApolloClient({
        link: from([createErrorLink(), createHttpLink()]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: { fetchPolicy: "cache-and-network" },
            query: { fetchPolicy: "network-only" },
        },
    });
}

/**
 * ApolloWrapper — wraps the app with ApolloProvider and silent auth refresh.
 */
export function ApolloWrapper({ children }: { children: ReactNode }) {
    const client = useMemo(() => makeClient(), []);
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
