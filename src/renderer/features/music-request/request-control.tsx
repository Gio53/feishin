import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import { musicRequestFetch, MusicRequestRecord } from '/@/renderer/features/music-request/music-request-api';
import { Button } from '/@/shared/components/button/button';
import { Group } from '/@/shared/components/group/group';
import { Modal } from '/@/shared/components/modal/modal';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';

type RequestPayload = {
    album?: string;
    artist?: string;
    jellyfinAlbumId?: string;
    jellyfinArtistId?: string;
    musicbrainzAlbumId?: string;
    musicbrainzArtistId?: string;
    type: 'album' | 'artist';
};

export function RequestControl({
    alreadyRequested,
    confirmTitle,
    inLibrary,
    label,
    payload,
    onRequested,
}: {
    alreadyRequested?: boolean;
    confirmTitle: string;
    inLibrary?: boolean;
    label: string;
    onRequested?: () => void;
    payload: RequestPayload;
}) {
    const [opened, handlers] = useDisclosure(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState<'library' | 'requested' | null>(
        inLibrary ? 'library' : alreadyRequested ? 'requested' : null,
    );

    useEffect(() => {
        if (inLibrary) return;
        let cancelled = false;
        musicRequestFetch<MusicRequestRecord[]>('/api/requests?mine=true')
            .then((rows) => {
                if (cancelled) return;
                const match = rows.some((row) => {
                    if (payload.type === 'album') {
                        return (
                            (payload.jellyfinAlbumId &&
                                row.jellyfinAlbumId === payload.jellyfinAlbumId) ||
                            (payload.musicbrainzAlbumId &&
                                row.musicbrainzAlbumId === payload.musicbrainzAlbumId)
                        );
                    }
                    return (
                        (payload.jellyfinArtistId &&
                            row.jellyfinArtistId === payload.jellyfinArtistId) ||
                        (payload.musicbrainzArtistId &&
                            row.musicbrainzArtistId === payload.musicbrainzArtistId)
                    );
                });
                if (match) setDone('requested');
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [
        inLibrary,
        payload.jellyfinAlbumId,
        payload.jellyfinArtistId,
        payload.musicbrainzAlbumId,
        payload.musicbrainzArtistId,
        payload.type,
    ]);

    if (done === 'library') {
        return <Text>Already in library</Text>;
    }
    if (done === 'requested' || alreadyRequested) {
        return <Text>Already requested</Text>;
    }

    async function confirm() {
        setBusy(true);
        setError('');
        try {
            await musicRequestFetch<MusicRequestRecord>('/api/requests', {
                body: JSON.stringify(payload),
                method: 'POST',
            });
            setDone('requested');
            onRequested?.();
            handlers.close();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not send the request.';
            if (message === 'Already in library') {
                setDone('library');
                handlers.close();
                return;
            }
            setError(message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Button onClick={handlers.open} variant="filled">
                {label}
            </Button>
            <Modal handlers={handlers} opened={opened} title={confirmTitle}>
                <Stack>
                    <Text>
                        {payload.type === 'album'
                            ? `Request “${payload.album}” by ${payload.artist}? Lidarr will search for it.`
                            : `Request every album by ${payload.artist} that is not already in Jellyfin?`}
                    </Text>
                    {error && <Text c="red">{error}</Text>}
                    <Group justify="flex-end">
                        <Button onClick={handlers.close} variant="default">
                            Cancel
                        </Button>
                        <Button loading={busy} onClick={() => void confirm()} variant="filled">
                            Request
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
