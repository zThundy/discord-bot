import { MessageEmbed } from "discord.js";
import { QueueSong } from "./yt-engine.js";

export async function run(client, args, message) {
    let errMessage;
    let voiceChannel = message.member.voice.channel;
    if (!args[1])
        errMessage = "Choose a link first 😋";
    if (!voiceChannel)
        errMessage = "You need to be in a voice channel 😅";
    if (!errMessage) {
        let permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) 
            errMessage = "I cannot join the voice channel you're in ☹️";
    }
    if (errMessage) {
        let embed = new MessageEmbed()
            .setDescription(errMessage)
            .setColor("#FF0000");
        message.channel.send({ embed });
        return;
    }
    QueueSong(client, args, message, voiceChannel, true);
}


// VIDEO DETAILS

// videoDetails: {
//     embed: {
//         iframeUrl: 'https://www.youtube.com/embed/tNveMjoSxp0',
//         flashUrl: 'http://www.youtube.com/v/tNveMjoSxp0?version=3&autohide=1',
//         width: 480,
//         height: 360,
//         flashSecureUrl: 'https://www.youtube.com/v/tNveMjoSxp0?version=3&autohide=1'
//     },
//     title: 'Initial D Night of Fire',
//     description: ' ',
//     lengthSeconds: '301',
//     ownerProfileUrl: 'http://www.youtube.com/user/BOXER33BUSSOV6',
//     externalChannelId: 'UCquKTbdDn7pe9E8Q5IuvWCw',
//     isFamilySafe: true,
//     availableCountries: [
//       'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR',
//       'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE',
//       'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ',
//       'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD',
//       'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR',
//       'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM',
//       'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI',
//       'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
//       'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS',
//       'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
//       ... 149 more items
//     ],
//     isUnlisted: false,
//     hasYpcMetadata: false,
//     viewCount: '16805103',
//     category: 'Film & Animation',
//     publishDate: '2011-05-10',
//     ownerChannelName: 'BOXER33BUSSOV6',
//     uploadDate: '2011-05-10',
//     videoId: 'tNveMjoSxp0',
//     keywords: [ 'Initial', 'D', 'Night', 'of', 'Fire' ],
//     channelId: 'UCquKTbdDn7pe9E8Q5IuvWCw',
//     isOwnerViewing: false,
//     isCrawlable: true,
//     averageRating: 4.9278078,
//     allowRatings: true,
//     author: {
//         id: 'UCquKTbdDn7pe9E8Q5IuvWCw',
//         name: 'BOXER33BUSSOV6',
//         user: 'BOXER33BUSSOV6',
//         channel_url: 'https://www.youtube.com/channel/UCquKTbdDn7pe9E8Q5IuvWCw',
//         external_channel_url: 'https://www.youtube.com/channel/UCquKTbdDn7pe9E8Q5IuvWCw',
//         user_url: 'http://www.youtube.com/user/BOXER33BUSSOV6',
//         thumbnails: [Array],
//         verified: false,
//         subscriber_count: 6340
//     },
//     isPrivate: false,
//     isUnpluggedCorpus: false,
//     isLiveContent: false,
//     media: {
//         song: 'Night of Fire (Extended mix)',
//         song_url: 'https://www.youtube.com/watch?v=YdHO0R4FeyQ',
//         category: 'Music',
//         category_url: 'https://music.youtube.com/',
//         artist: 'Niko',
//         artist_url: 'https://www.youtube.com/channel/UCYpcRHRmVwzEjeOagN0jUZA',
//         album: 'Bratt Sinclaire Eurobeat Style Vol.7',
//         writers: 'A.Leonardi',
//         'licensed to youtube by': 'Pirames International Srl (on behalf of Sinclairestyle Srl); ASCAP, Create Music Publishing, LatinAutorPerf, and 9 Music Rights Societies'
//     },
//     likes: 108489,
//     dislikes: 1994,
//     age_restricted: false,
//     video_url: 'https://www.youtube.com/watch?v=tNveMjoSxp0',
//     storyboards: [ [Object], [Object], [Object], [Object] ],
//     thumbnails: [ [Object], [Object], [Object], [Object] ]
// }