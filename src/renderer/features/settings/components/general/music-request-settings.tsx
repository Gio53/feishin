import { memo } from 'react';

import {
    SettingOption,
    SettingsSection,
} from '/@/renderer/features/settings/components/settings-section';
import { useGeneralSettings, useSettingsStoreActions } from '/@/renderer/store/settings.store';
import { TextInput } from '/@/shared/components/text-input/text-input';

export const MusicRequestSettings = memo(() => {
    const settings = useGeneralSettings();
    const { setSettings } = useSettingsStoreActions();

    const options: SettingOption[] = [
        {
            control: (
                <TextInput
                    onChange={(event) =>
                        setSettings({
                            general: { musicRequestUrl: event.currentTarget.value },
                        })
                    }
                    placeholder="http://127.0.0.1:5656"
                    value={settings.musicRequestUrl || ''}
                    w={280}
                />
            ),
            description: 'Base URL of your Music Request server, without a trailing path.',
            title: 'Music Request URL',
        },
        {
            control: (
                <TextInput
                    onChange={(event) =>
                        setSettings({
                            general: { musicRequestToken: event.currentTarget.value },
                        })
                    }
                    placeholder="Paste the token from Music Request"
                    type="password"
                    value={settings.musicRequestToken || ''}
                    w={280}
                />
            ),
            description: 'Shown on My Requests in the Music Request app. Sent as a bearer token.',
            title: 'API token',
        },
    ];

    return <SettingsSection options={options} title="Music Request" />;
});

MusicRequestSettings.displayName = 'MusicRequestSettings';
