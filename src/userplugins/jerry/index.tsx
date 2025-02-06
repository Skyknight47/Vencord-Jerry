/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { sendBotMessage } from "@api/Commands";
import { definePluginSettings } from "@api/Settings";
import { toHTML } from "@odiffey/discord-markdown";
import definePlugin, { OptionType, StartAt } from "@utils/types";
import { saveFile } from "@utils/web";
import { findByPropsLazy } from "@webpack";
import { GuildMemberStore, GuildStore, MessageStore, React, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

const settings = definePluginSettings({
    // enabled: {
    //     type: OptionType.BOOLEAN,
    //     description: "Enable or disable the plugin",
    //     default: true,
    // },
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
// async function fetchMessages(channelId: string) {
//     const channel = getChannel(channelId);
//     if (!channel) {
//         console.error(`Channel with ID ${channelId} not found.`);
//         return;
//     }

//     try {
//         const messages = await channel.messages.fetch({ limit: 100 });
//         messages.forEach(msg => {
//             console.log(msg.content); // Process messages as needed
//         });
//     } catch (error) {
//         console.error("Error fetching messages:", error);
//     }
// }

async function initializeTranscript(channelId) {
    const channel = getChannel(channelId);
    const myGuildId = SelectedGuildStore.getGuildId();
    var tempcolor = "";
    var channelText: any[] = [];


    const messages = MessageStore.getMessages(channelId);
        messages.forEach(msg => {
            var authorNick = GuildMemberStore.getNick(myGuildId, msg.author.id);
            var nicknameOrUsername;
            var clonedMsgContent = msg.content;
            if (authorNick !== null && authorNick !== undefined) {
                nicknameOrUsername = `${authorNick} (${msg.author.username})`;
            } else {
                nicknameOrUsername = msg.author.username;
            }

            if (msg.embeds.length !== 0) {
                if (msg.author.bot === true) {
                    tempcolor = msg.embeds[0].color;
                    console.log(msg.embeds[0]);
                    if (msg.embeds[0].fields.length !== 0) {
                        clonedMsgContent = clonedMsgContent.replace(
                            /<@!?(\d+)>/g,
                            (match, p1) => `<font color="#5F7C8A">@${UserStore.getUser(p1).username}</font>`,
                        );
                        console.log(GuildStore.getGuild(myGuildId));
                        clonedMsgContent = clonedMsgContent.replace(
                            /<@&(\d+)>/g,
                            (match, p1) => `<font color="${GuildStore.getRole(myGuildId, p1).colorString}">${GuildStore.getRole(myGuildId, p1).name}</font>`,
                        );
                        clonedMsgContent = clonedMsgContent.replace(
                            /<#(\d+)>/g,
                            (match, p1) => `#${getChannel(p1).name}`,
                        );
                        clonedMsgContent = clonedMsgContent.replace(
                            /\\n/g,
                            (match, p1) => "<br></br>",
                        );
                        var fieldAddedTranscriptEmbedObject;
                        console.log(msg);
                        var transcriptEmbedObject = `<div class="message"> <img
        src=https://cdn.discordapp.com/attachments/639980539960492043/923711923298660412/BA_bot.png>
        <h2> <span class="sender-name">${nicknameOrUsername}</span> <span
            class="message-time">${msg.timestamp}</span> </h2>
        <div class="embed-container">
        <div class="embed">
            <div class="author "> <img class="author-icon"
            src=${`https://cdn.discordapp.com/avatars/${authorFound.id}/${authorFound.avatar}.webp?size=80` || ""}>
              <div class="author-name">${msg.embeds[0].author.name}</div>
            </div> <img class="thumbnail" src="">
            <div class="embed-title"> <span class="title">${msg.embeds[0].rawTitle}</span> </div>
            <div class="embed-description">${msg.embeds[0].rawDescription || ""}</div>
            <div class="fields">
          `;
                        msg.embeds.MessageEmbed.fields.forEach(fieldObject => {
                            var STA = `<div class="">
                <div class="field-title">${fieldObject.name}</div>
                <div class="field-content">${fieldObject.value}</div>`;
                            fieldAddedTranscriptEmbedObject = transcriptEmbedObject.concat(String(STA));
                        });

                        var completedEmbed = fieldAddedTranscriptEmbedObject.concat(`</div>
              </div>`);
                        channelText.push(completedEmbed);
                    } else {
                        clonedMsgContent = clonedMsgContent.replace(
                            /<@!?(\d+)>/g,
                            (match, p1) => `<font color="#5F7C8A">@${UserStore.getUser(p1).username}</font>`,
                        );
                        console.log(GuildStore.getGuild(myGuildId));
                        clonedMsgContent = clonedMsgContent.replace(
                            /<@&(\d+)>/g,
                            (match, p1) => `<font color="${GuildStore.getRole(myGuildId, p1).colorString}">${GuildStore.getRole(myGuildId, p1).name}</font>`,
                        );
                        clonedMsgContent = clonedMsgContent.replace(
                            /<#(\d+)>/g,
                            (match, p1) => `#${getChannel(p1).name}`,
                        );
                        clonedMsgContent = clonedMsgContent.replace(
                            /\\n/g,
                            (match, p1) => "<br></br>",
                        );

                        var authorFound;
                        if (msg.embeds[0].author !== null) {
                            authorFound = msg.embeds[0].author;
                        } else {
                            authorFound = "";
                        }


                        var transcriptEmbedObject = `<div class="message"> <img
              src=https://cdn.discordapp.com/attachments/639980539960492043/923711923298660412/BA_bot.png>
              <h2> <span class="sender-name">${nicknameOrUsername}</span> <span
                  class="message-time">${msg.timestamp}</span> </h2>
              <div class="embed-container">
              <div class="embed">
                  <div class="author "> <img class="author-icon"
                  src=${`https://cdn.discordapp.com/avatars/${authorFound.id}/${authorFound.avatar}.webp?size=80`|| ""}>
                      <div class="author-name">${authorFound.name || ""}</div>
                  </div> <img class="thumbnail" src="${msg.embeds[0].thumbnail || ""}">
                  <div class="embed-title"> <span class="title">${msg.embeds[0].rawTitle || ""}</span> </div>
                  <div class="embed-description">${msg.embeds[0].rawDescription || ""}</div>
                  <div class="embed-color">
                `;
                        channelText.push(transcriptEmbedObject);
                    }
                }
            } else {

                clonedMsgContent = clonedMsgContent.replace(
                    /<@!?(\d+)>/g,
                    (match, p1) => `<font color="#5F7C8A">@${UserStore.getUser(p1).username}</font>`,
                );
                console.log(GuildStore.getGuild(myGuildId));
                clonedMsgContent = clonedMsgContent.replace(
                    /<@&(\d+)>/g,
                    (match, p1) => `<font color="${GuildStore.getRole(myGuildId, p1).colorString}">${GuildStore.getRole(myGuildId, p1).name}</font>`,
                );
                clonedMsgContent = clonedMsgContent.replace(
                    /<#(\d+)>/g,
                    (match, p1) => `#${getChannel(p1).name}`,
                );
                clonedMsgContent = clonedMsgContent.replace(
                    /\\n/g,
                    (match, p1) => "<br></br>",
                );
                var botUrl;
                if (msg.author.bot) {
                    botUrl = "https://cdn.discordapp.com/attachments/639980539960492043/923711923298660412/BA_bot.png";
                } else {
                    console.log(msg);
                    console.log(UserStore.getUser(msg.author.id));
                    botUrl = `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.webp?size=80`;

                }

                var transcriptMessageObject = `<div class="message"> <img
        src=${botUrl}>
    <h2> <span class="sender-name">${nicknameOrUsername}</span> <span
            class="message-time">${msg.timestamp}</span> </h2>
    <div>${toHTML(clonedMsgContent, {
        discordCallback: {
            user: node => `<font color="#5F7C8A">@${UserStore.getUser(node.id).username}</font>`,
            role: node => `<font color="${GuildStore.getRole(myGuildId, node.id).colorString}">${GuildStore.getRole(myGuildId, node.id).name}</font>`,
            channel: node => `<font color="#5F7C8A">#${getChannel(node.id).name}</font>`,
        }
    })}</div>
    </div>`;
                // <div>${clonedMsgContent}</div>
                channelText.push(transcriptMessageObject);
            }
        });
    channelText.sort((a, b) => a.createdTimestamp + b.createdTimestamp);
    console.log(tempcolor);
    var hexString = tempcolor;// .toString(16);
    const transcriptFileData = `<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket Transcript - by Atekcore Inc</title>
      <link rel="icon" type="image/png" sizes="192x192" href="../favicon.png">
      <style>
          :root {
              --bg-dark-primary: #2f3136;
              --bg-dark-ticket: #36393f;
              --bg-dark-embed: #202225;
              --text-dark: white;
              --bg-light-primary: #f2f3f5;
              --bg-light-ticket: white;
              --bg-light-embed: #e3e5e8;
              --text-light: black;
              --bg-primary: var(--bg-dark-primary);
              --bg-ticket: var(--bg-dark-ticket);
              --bg-embed: var(--bg-dark-embed);
              --text: var(--text-dark);
              --embed-width: 550px;
          }

          #theme-switch:checked~.theme-wrapper {
              --bg-primary: var(--bg-light-primary);
              --bg-ticket: var(--bg-light-ticket);
              --bg-embed: var(--bg-light-embed);
              --text: var(--text-light);
          }

          * {
              margin: 0px;
              padding: 0px;
          }

          .hide {
              display: none;
          }

          img[src=""] {
              display: none;
          }

          #theme-switch~div .theme-selector::after {
              color: white;
              content: 'Dark mode';
          }

          #theme-switch:checked~div .theme-selector::after {
              color: black;
              content: 'Light mode';
          }

          #desc-theme-switch~div .theme-selector::after {
            color: white;
        }

        #desc-theme-switch:checked~div .theme-selector::after {
            color: black;
        }

          .ticket {
              background-color: var(--bg-ticket);
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 85vw;
              height: 90vh;
              border-radius: 20px;
              color: var(--text);
              overflow-y: scroll;
              -ms-overflow-style: none;
              scrollbar-width: none;
          }

          .theme-wrapper {
              background-color: var(--bg-primary);
              font-family: sans-serif;
              width: 100vw;
              height: 100vh;
          }

          .ticket::-webkit-scrollbar {
              display: none;
          }

          .header {
              font-size: 20px;
              margin: 20px;
              margin-bottom: 15px;
          }

          .message {
              padding: 10px;
              padding-left: 20px;
              padding-bottom: 5px;
              display: inline-block;
              width: calc(100% - 40px);
          }

          .message::before {
              margin-left: auto;
              margin-right: auto;
              min-height: 2px;
              display: block;
              background-color: lightgray;
              content: '';
              margin-bottom: 10px;
          }

          .message>img {
              max-width: 50px;
              border-radius: 50%;
              margin-right: 10px;
              float: left;
          }

          .message h2 {
              float: left;
              padding-bottom: 5px;
          }

          .message h2 .sender-name {
              color: var(--text);
              font-size: 18px;
          }

          .message h2 .message-time {
              color: lightgray;
              font-size: 13px;
          }

          .message>div {
              width: calc(100% - 60px);
              max-width: calc(100% - 60px);
              float: left;
              padding-bottom: 3px;
              margin-left: 60px;
              overflow-wrap: break-word;
          }

          .message>div:first-of-type {
              margin-left: 0px;
          }

          .message .embed-container {
              box-sizing: border-box;
              border-left: 5px solid #${hexString};
              border-radius: 5px;
              padding-bottom: 0px;
          }

          .embed div .title[content="{{ TITLE }}"] {
              display: none;
          }

          .embed>.author>.author-icon,
          .embed .footer .footer-icon {
              max-width: 25px;
              border-radius: 50%;
              margin-right: 10px;
              float: left;
          }

          .embed>.author .author-name {
              font-weight: bold;
              display: flex;
              align-items: center;
              height: 100%
          }

          .embed>.author .author-name[content="{{ AUTHOR }}"] {
              display: none;
          }

          .message .embed {
              margin-left: 0px;
              background-color: var(--bg-embed);
              padding: 10px;
              display: grid;
              max-width: var(--embed-width);
              font-size: 14px;
              grid-template-columns: auto min-content;
          }

          .embed .embed-description {
              font-size: 16px;
          }

          .embed .thumbnail {
              grid-column: 2;
              grid-row: span 3;
              max-width: 80px;
              border-radius: 5px;
          }

          .embed>div {
              margin-top: 8px;
              grid-column: 1;
          }

          .embed>div:blank {
              display: none;
          }

          .embed .fields {
              display: grid;
              grid-template-columns: auto auto auto;
              padding-top: 5px;
              column-gap: 10px;
          }

          .embed .fields>div {
              padding-bottom: 10px;
          }

          .embed .fields img {
              max-width: 440px;
          }

          .embed div span.title {
              font-size: 16px;
              font-weight: bold;
          }

          .embed .fields div .embed-title {
              font-weight: bold;
              padding-bottom: 3px;
          }

          .embed .fields>div:not([class]) {
              grid-column: span 3;
          }

          .embed .footer .footer-text {
              color: lightgray;
              display: flex;
              align-items: center;
              height: 100%
          }
      </style>
  </head>
  <body> <input type="checkbox" id="theme-switch" style="display: none">
      <div class="theme-wrapper"> <label for="theme-switch" class="theme-selector"></label>
      <div class= "ticket-desc">This is the transcript of support ticket: ${getChannel(channelId).name}</div>
        <div class="ticket">
        <div class="header">#${getChannel(channelId).name}</div>
          ${channelText}
        </div>
    </div>
  </body>`;
    const file = new File([transcriptFileData], `ticket-transcript-${channelId}`, { type: "text/html" });

    saveFile(file);
    sendBotMessage(
        channelId,
        {
            content: "*Transcript Saved ✅*",
            author: UserStore.getUser("643945264868098049"),
            attachments:  undefined,
        }
    );
    return;
}



// // Transcribe Button Component
// function TranscribeButton() {
//     const handleClick = () => {
//         if (!SelectedChannelStore || !SelectedChannelStore.getChannelId) {
//             return console.error("SelectedChannelStore not found");
//         }
//         const channelId = SelectedChannelStore.getChannelId();
//         if (!channelId) {
//             console.error("No active channel found.");
//             return;
//         }
//         var transcriptResult = fetchMessages(channelId);
//         if (await transcriptResult == true){

//         }

//     };

//     return (
//         <button onClick={handleClick} >
//             Transcribe
//         </button>
//     );
// }

// // Injecting the button into the message input field
// const ChannelTextAreaContainer = findByPropsLazy("ChannelTextAreaContainer");

// if (ChannelTextAreaContainer?.type) {
//     const OriginalType = ChannelTextAreaContainer.type;

//     ChannelTextAreaContainer.type = function PatchedType(props: any) {
//         const res = OriginalType.call(this, props);
//         if (settings.use().enabled) {
//             res.props.children.push(<TranscribeButton />);
//         }
//         return res;
//     };
// }

const TranscriptButton: ChatBarButtonFactory = ({ isMainChat, type: { attachments } }) => {
    const channelId = SelectedChannelStore.getChannelId();

    if (!isMainChat) return null;
    if (!channelId) return null;

    return (
        <ChatBarButton
            tooltip="Transcript Channel"
            onClick={() => initializeTranscript(channelId)}
                // sendBotMessage(
                //     channelId,
                //     {
                //         content: getDraft(channelId),
                //         author: UserStore.getCurrentUser(),
                //         attachments: hasAttachments ? await getAttachments(channelId) : undefined,
                //     }
                // )}
            buttonProps={{
                style: {
                    translate: "0 2px"
                }
            }}
        >
            <svg
                fill="currentColor"
                fillRule="evenodd"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                style={{ scale: "1.096", translate: "0 -1px" }}
            >
                <path d="M24,19V7c0-1.657-1.343-3-3-3H7C5.343,4,4,5.343,4,7v5h4v12c0,1.657,1.343,3,3,3h14  c1.657,0,3-1.343,3-3v-5H24z M8,10H6V7c0-0.551,0.449-1,1-1c0.552,0,1,0.448,1,1V10z M10,24V7c0-0.35-0.06-0.687-0.171-1H21  c0.551,0,1,0.449,1,1v12H12v5c0,0.552-0.448,1-1,1C10.449,25,10,24.551,10,24z M26,24c0,0.551-0.449,1-1,1H13.829  C13.94,24.687,14,24.35,14,24v-3h12V24z M20,12h-8v-2h8V12z M20,16h-8v-2h8V16z" />
            </svg>
        </ChatBarButton>
    );

};

export default definePlugin({
    name: "Jerry",
    description: "Transcribes messages in specified Discord channels.",
    authors: [{ name: "SkyKnight47", id: 401808627729694720n }],
    settings,
    startAt: StartAt.Init,

    renderChatBarButton: TranscriptButton,

});
