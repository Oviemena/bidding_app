import { pageCacheKey } from "$services/keys";
import { client } from "$services/redis";

const cachedPage = [
    '/about',
    '/privacy',
    '/auth/signin',
    '/auth/signup'
]
export const getCachedPage = (route: string) => {
    if ( cachedPage.includes(route)) {
        return client.get(pageCacheKey(route))
    }
    return null;
};

export const setCachedPage = (route: string, page: string) => {
    if ( cachedPage.includes(route)) {
        return client.set(pageCacheKey(route), page, {
            EX: 3
        })
    }
};
