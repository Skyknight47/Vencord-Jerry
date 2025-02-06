/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { React } from "@webpack/common";

const settings = definePluginSettings({
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Enable or disable the plugin",
        default: true,
    },
    autoExecute: {
        type: OptionType.BOOLEAN,
        description: "Enable or disable automatic transcripting for RegEx Channel name",
        default: false,
    },
    channelPattern: {
        type: OptionType.STRING,
        description: "Regular expression to match channel names",
        default: ".*", // Matches all channels by default
    },
});
const ChannelStore = findByPropsLazy("getChannel", "getDMFromUserId");

function getChannel(channelId: string) {
    if (!ChannelStore || !ChannelStore.getChannel) {
        console.error("ChannelStore module not found.");
        return null;
    }

    return ChannelStore.getChannel(channelId);
}
// Function to fetch messages from a specified channel
async function fetchMessages(channelId: string) {
    const channel = getChannel(channelId);
    if (!channel) {
        console.error(`Channel with ID ${channelId} not found.`);
        return;
    }

    try {
        const messages = await channel.messages.fetch({ limit: 100 });
        messages.forEach(msg => {
            console.log(msg.content); // Process messages as needed
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}
const SelectedChannelStore = findByPropsLazy("getChannelId");

// Transcribe Button Component
function TranscribeButton() {
    const handleClick = () => {
        if (!SelectedChannelStore || !SelectedChannelStore.getChannelId) {
            return console.error("SelectedChannelStore not found");
        }
        const channelId = SelectedChannelStore.getChannelId();
        if (!channelId) {
            console.error("No active channel found.");
            return;
        }
        fetchMessages(channelId);

    };

    return (
        <button onClick={handleClick} >
            Transcribe
        </button>
    );
}

// Injecting the button into the message input field
const ChannelTextAreaContainer = findByPropsLazy("ChannelTextAreaContainer");

if (ChannelTextAreaContainer?.type) {
    const OriginalType = ChannelTextAreaContainer.type;

    ChannelTextAreaContainer.type = function PatchedType(props: any) {
        const res = OriginalType.call(this, props);
        if (settings.use().enabled) {
            res.props.children.push(<TranscribeButton />);
        }
        return res;
    };
}

export default definePlugin({
    name: "Jerry",
    description: "Transcribes messages in specified Discord channels.",
    authors: [{ name: "SkyKnight47", id: 401808627729694720n }],
    patches: [],
    settings,
});
