import { FormEvent, useState } from 'react';

import {
    musicRequestFetch,
    MusicRequestSearch,
} from '/@/renderer/features/music-request/music-request-api';
import { RequestControl } from '/@/renderer/features/music-request/request-control';
import { Button } from '/@/shared/components/button/button';
import { Group } from '/@/shared/components/group/group';
import { ScrollArea } from '/@/shared/components/scroll-area/scroll-area';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';
import { TextInput } from '/@/shared/components/text-input/text-input';
import { TextTitle } from '/@/shared/components/text-title/text-title';

export const MusicRequestSearchRoute = () => {
    const [term, setTerm] = useState('');
    const [result, setResult] = useState<MusicRequestSearch | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function search(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const data = await musicRequestFetch<MusicRequestSearch>(
                `/api/search?term=${encodeURIComponent(term.trim())}`,
            );
            setResult(data);
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : 'Search failed.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <ScrollArea>
            <Stack gap="lg" p="lg">
                <div>
                    <TextTitle order={2}>Request music</TextTitle>
                    <Text c="dimmed">
                        Search artists and albums that are not in your library yet. Lidarr downloads
                        them, then Jellyfin picks them up.
                    </Text>
                </div>
                <form onSubmit={(event) => void search(event)}>
                    <Group align="flex-end">
                        <TextInput
                            label="Artist or album"
                            onChange={(event) => setTerm(event.currentTarget.value)}
                            style={{ flex: 1 }}
                            value={term}
                        />
                        <Button loading={busy} type="submit" variant="filled">
                            Search
                        </Button>
                    </Group>
                </form>
                {error && <Text c="red">{error}</Text>}
                {result?.artists.map((artist) => (
                    <Group justify="space-between" key={artist.musicbrainzArtistId}>
                        <div>
                            <Text fw={600}>{artist.name}</Text>
                            {artist.inLibrary && <Text c="dimmed">Already has music in Jellyfin</Text>}
                        </div>
                        <RequestControl
                            alreadyRequested={artist.requested}
                            confirmTitle="Request missing albums"
                            label="Request all missing albums"
                            payload={{
                                artist: artist.name,
                                musicbrainzArtistId: artist.musicbrainzArtistId,
                                type: 'artist',
                            }}
                        />
                    </Group>
                ))}
                {result?.albums.map((album) => (
                    <Group justify="space-between" key={album.musicbrainzAlbumId}>
                        <div>
                            <Text fw={600}>{album.title}</Text>
                            <Text c="dimmed">
                                {album.artist}
                                {album.year ? ` · ${album.year}` : ''}
                            </Text>
                        </div>
                        <RequestControl
                            alreadyRequested={album.requested}
                            confirmTitle="Request this album"
                            inLibrary={album.inLibrary}
                            label="Request this album"
                            payload={{
                                album: album.title,
                                artist: album.artist,
                                musicbrainzAlbumId: album.musicbrainzAlbumId,
                                musicbrainzArtistId: album.musicbrainzArtistId,
                                type: 'album',
                            }}
                        />
                    </Group>
                ))}
                {result && result.artists.length === 0 && result.albums.length === 0 && (
                    <Text c="dimmed">No artists or albums matched that search.</Text>
                )}
            </Stack>
        </ScrollArea>
    );
};

export default MusicRequestSearchRoute;
