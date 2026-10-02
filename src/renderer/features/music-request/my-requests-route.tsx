import { useEffect, useState } from 'react';

import {
    musicRequestFetch,
    MusicRequestRecord,
} from '/@/renderer/features/music-request/music-request-api';
import { Group } from '/@/shared/components/group/group';
import { ScrollArea } from '/@/shared/components/scroll-area/scroll-area';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';
import { TextTitle } from '/@/shared/components/text-title/text-title';

export const MyRequestsRoute = () => {
    const [requests, setRequests] = useState<MusicRequestRecord[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        musicRequestFetch<MusicRequestRecord[]>('/api/requests?mine=true')
            .then(setRequests)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : 'Could not load requests.'),
            );
    }, []);

    return (
        <ScrollArea>
            <Stack gap="md" p="lg">
                <TextTitle order={2}>My Requests</TextTitle>
                {error && <Text c="red">{error}</Text>}
                {requests.length === 0 && !error && <Text c="dimmed">No requests yet.</Text>}
                {requests.map((request) => (
                    <Group justify="space-between" key={request.id}>
                        <div>
                            <Text fw={600}>
                                {request.type === 'album' ? request.album : request.artist}
                            </Text>
                            <Text c="dimmed">
                                {request.type === 'album' ? request.artist : 'All missing albums'}
                            </Text>
                            {request.error && <Text c="red">{request.error}</Text>}
                        </div>
                        <Text tt="capitalize">{request.status}</Text>
                    </Group>
                ))}
            </Stack>
        </ScrollArea>
    );
};

export default MyRequestsRoute;
