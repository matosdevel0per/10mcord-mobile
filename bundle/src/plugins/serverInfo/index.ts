/*
 * 10MCord for Android
 * Copyright (c) 2026 rootpoi and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getLanguage, t, tx } from "@core/i18n";

import { definePlugin } from "../api";
import { getStore } from "../common";
import { botMessage, command, getGuild, localSnowflake, receiveLocalMessage } from "../hooks";
import { CDN } from "../shared/lookup";

const COMPONENTS_V2 = 1 << 15;
const snowflakeMs = (id: string) => Number((BigInt(id) >> 22n) + 1420070400000n);
const number = (value: number) => new Intl.NumberFormat(getLanguage() === "pt" ? "pt-BR" : getLanguage()).format(value);
const escapeMarkdown = (value: string) => [...value].map(character => "\\`*_{}[]()#+-.!|>~".includes(character) ? `\\${character}` : character).join("");
const assetUrl = (base: string, id: string, hash: string, size = 2048) =>
    `${CDN}/${base}/${id}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=${size}`;

const unfurledMediaItem = (url: string) => ({
    url,
    proxyUrl: url,
    loadingState: 2,
});

export default definePlugin({
    id: "10MCord.server-info",
    name: "ServerInfo",
    description: tx("Show a detailed server card with its owner, members, and images"),
    icon: "ServerIcon",
    tags: ["Servers", "Utility"],
    start({ cleanup }) {
        cleanup(command({
            name: "serverinfo",
            description: tx("Show detailed information about this server"),
            run: (_, ctx) => {
                const guildId = ctx.channel.guild_id;
                const guild = getGuild(guildId);
                if (!guild) {
                    botMessage(ctx.channel.id, t("This command only works in a server."));
                    return;
                }

                const counts = getStore("GuildMemberCountStore");
                const members = counts?.getMemberCount?.(guild.id) ?? guild.memberCount;
                const online = counts?.getOnlineCount?.(guild.id);
                const channels = Object.values(getStore("ChannelStore")?.getMutableGuildChannelsForGuild?.(guild.id) ?? {}).length;
                const roles = Object.keys(getStore("GuildRoleStore")?.getRoles?.(guild.id)
                    ?? getStore("GuildRoleStore")?.getUnsafeMutableRoles?.(guild.id)
                    ?? guild.roles
                    ?? {}).length;
                const owner = getStore("UserStore")?.getUser?.(guild.ownerId);
                const ownerName = owner?.globalName ?? owner?.global_name ?? owner?.username ?? guild.ownerId ?? t("Not available");
                const icon = guild.icon ? assetUrl("icons", guild.id, guild.icon, 1024) : undefined;
                const images = [
                    guild.banner && { url: assetUrl("banners", guild.id, guild.banner), description: t("Server banner") },
                    guild.splash && { url: assetUrl("splashes", guild.id, guild.splash), description: t("Invite background") },
                    guild.discoverySplash && { url: assetUrl("discovery-splashes", guild.id, guild.discoverySplash), description: t("Discovery banner") },
                ].filter(Boolean) as { url: string; description: string }[];
                const channelsValue = channels ? number(channels) : t("Not available");
                const rolesValue = roles ? number(roles) : t("Not available");
                const memberValue = members != null ? number(Number(members)) : t("Not available");
                const onlineValue = online != null ? number(Number(online)) : t("Not available");
                const created = Math.floor(snowflakeMs(guild.id) / 1000);

                const components: any[] = [
                    icon
                        ? {
                            type: 9,
                            components: [{ type: 10, content: `## ${escapeMarkdown(guild.name)}\n${t("Server information")}` }],
                            accessory: { type: 11, media: unfurledMediaItem(icon), description: t("Server icon") },
                        }
                        : { type: 10, content: `## ${escapeMarkdown(guild.name)}\n${t("Server information")}` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: `**${t("Owner")}**\n${escapeMarkdown(ownerName)}` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: `**${t("Members")}**: ${memberValue}\n**${t("Members online")}**: ${onlineValue}` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: `**${t("Channels")}**: ${channelsValue} · **${t("Roles")}**: ${rolesValue}\n**${t("Boosts")}**: ${number(Number(guild.premiumSubscriberCount ?? 0))} · **${t("Level {level}", { level: guild.premiumTier ?? 0 })}**` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: `**${t("Created")}**: <t:${created}:D> · <t:${created}:R>\n**${t("ID")}**: \`${guild.id}\`${guild.vanityURLCode ? `\n**${t("Vanity URL")}**: discord.gg/${guild.vanityURLCode}` : ""}` },
                ];
                if (images.length) components.push({ type: 12, items: images.map(image => ({ media: unfurledMediaItem(image.url), description: image.description })) });

                const user = getStore("UserStore")?.getCurrentUser?.();
                if (!user?.id) {
                    botMessage(ctx.channel.id, t("Couldn't load your Discord account."));
                    return;
                }

                // This command used to be local-only. Keep it private and never send a forged V2 message to Discord.
                receiveLocalMessage(ctx.channel.id, {
                    id: localSnowflake(),
                    channel_id: ctx.channel.id,
                    content: "",
                    timestamp: new Date().toISOString(),
                    edited_timestamp: null,
                    type: 0,
                    flags: COMPONENTS_V2,
                    mentions: [],
                    mention_roles: [],
                    attachments: [],
                    embeds: [],
                    components: [{ type: 17, components }],
                    author: {
                        id: user.id,
                        username: user.username ?? "?",
                        global_name: user.globalName ?? user.global_name ?? null,
                        discriminator: user.discriminator ?? "0",
                        avatar: user.avatar ?? null,
                        bot: false,
                    },
                    state: "SENT",
                });
            },
        }));
    },
});
