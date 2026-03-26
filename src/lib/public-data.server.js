const PUBLIC_DATA_REVALIDATE_SECONDS = 60;

const resolveApiBaseUrl = () =>
    (
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
    ).replace(/\/+$/, "");

const asArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

async function fetchPublicJson(path) {
    const baseUrl = resolveApiBaseUrl();

    if (!baseUrl) {
        throw new Error("Missing API base URL for server data fetching.");
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    return response.json();
}

export async function getPublicGames() {
    const payload = await fetchPublicJson("/api/games");
    return asArray(payload, ["games", "rows", "items"]).filter((item) => item?.gamecode);
}

export async function getPublicGameByCode(gamecode) {
    if (!gamecode) return null;
    return fetchPublicJson(`/api/games/game/${encodeURIComponent(gamecode)}`);
}

export async function getPublicPackagesByGameCode(gamecode) {
    if (!gamecode) return [];
    const payload = await fetchPublicJson(`/api/toup-package/game/${encodeURIComponent(gamecode)}`);
    return asArray(payload, ["packages", "rows", "items"]);
}
