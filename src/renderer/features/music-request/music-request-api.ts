import { useSettingsStore } from '/@/renderer/store/settings.store';

export type MusicRequestRecord = {
    album: null | string;
    artist: string;
    availableAt?: null | string;
    createdAt: string;
    error?: null | string;
    id: string;
    jellyfinAlbumId?: null | string;
    jellyfinArtistId?: null | string;
    musicbrainzAlbumId?: null | string;
    musicbrainzArtistId?: null | string;
    requester: string;
    status: 'available' | 'failed' | 'pending' | 'processing';
    type: 'album' | 'artist';
};

export type MusicRequestSearch = {
    albums: Array<{
        artist: string;
        cover?: null | string;
        inLibrary: boolean;
        musicbrainzAlbumId: string;
        musicbrainzArtistId: string;
        requestStatus: null | string;
        requested: boolean;
        title: string;
        year?: null | string;
    }>;
    artists: Array<{
        inLibrary: boolean;
        musicbrainzArtistId: string;
        name: string;
        poster?: null | string;
        requestStatus: null | string;
        requested: boolean;
    }>;
};

function config() {
    const { musicRequestToken, musicRequestUrl } = useSettingsStore.getState().general;
    const url = (musicRequestUrl || '').trim().replace(/\/+$/, '');
    const token = (musicRequestToken || '').trim();
    if (!url || !token) {
        throw new Error('Add the Music Request URL and token in Feishin settings.');
    }
    return { token, url };
}

export async function musicRequestFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const { token, url } = config();
    let response: Response;
    try {
        response = await fetch(`${url}${path}`, {
            ...init,
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
                ...(init?.headers || {}),
            },
        });
    } catch {
        throw new Error(`Music Request is unreachable at ${url}`);
    }
    const text = await response.text();
    const data = text ? (JSON.parse(text) as { error?: string }) : {};
    if (!response.ok) {
        throw new Error(data.error || `Music Request returned ${response.status}.`);
    }
    return data as T;
}
