const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const client = new Client({
    checkUpdate: false,
});

const AVATAR_DIR = path.join(__dirname, 'avatars');
if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR);
}

let originalAvatarPath = path.join(AVATAR_DIR, 'originalAvatar.png');

client.on('ready', () => {
    console.clear();
    printArt();

    const guildCount = client.guilds.cache.size;

    console.log("STATUS: \x1b[32mCONNECTED\x1b[0m");
    console.log(`Account: ${client.user.username} [${guildCount} Servers]`);
    console.log("------------------------------------------------------------------------------------------");
    console.log(`We have logged in as ${client.user.username}\nGuilds: ${guildCount}`);
});

function printArt() {
    const art = `
██████╗ ██████╗     ██████╗  ██████╗ ████████╗
██╔══██╗╚════██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██║  ██║ █████╔╝    ██████╔╝██║   ██║   ██║   
██║  ██║ ╚═══██╗    ██╔══██╗██║   ██║   ██║   
██████╔╝██████╔╝    ██████╔╝╚██████╔╝   ██║   
╚═════╝ ╚═════╝     ╚═════╝  ╚═════╝    ╚═╝   
                                              
    `;
    console.log(art);
}


const selfbotName = "D3 Selfbot";  

function send(message, messageContent) {
    const formattedMessage = `\`\`\`ini\n[ ${selfbotName} ]\n\n${messageContent}\`\`\``;
    return message.channel.send(formattedMessage);
}


client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;

    if (message.content.startsWith('!')) {
        message.delete().catch(console.error);
    }

    if (message.content.startsWith('!밴')) {
        const args = message.content.split(' ').slice(1);
        if (!args[0]) {
            return await send(message, '유저를 맨션해주세요.');
        }

        const userMention = message.mentions.users.first();
        if (!userMention) {
            return await send(message, '유저를 올바르게 맨션해주세요.');
        }

        try {
            await message.guild.members.ban(userMention);
            await send(message, `${userMention.tag}를 밴했습니다.`);
        } catch (error) {
            await send(message, `${userMention.tag}를 밴하는데 실패했습니다: ${error.message}`);
        }
    } else if (message.content.startsWith('!킥')) {
        const args = message.content.split(' ').slice(1);
        if (!args[0]) {
            return await send(message, '유저를 맨션해주세요.');
        }

        const userMention = message.mentions.users.first();
        if (!userMention) {
            return await send(message, '유저를 올바르게 맨션해주세요.');
        }

        try {
            const memberToKick = message.guild.members.cache.get(userMention.id);
            await memberToKick.kick();
            await send(message, `${userMention.tag}를 킥했습니다.`);
        } catch (error) {
            await send(message, `${userMention.tag}를 킥하는데 실패했습니다: ${error.message}`);
        }
    }     else if (message.content.startsWith('!사칭')) {
        const userMention = message.mentions.users.first();
        if (!userMention) {
            return await send(message, '유저를 올바르게 맨션해주세요.');
        }

        try {
            const currentAvatar = client.user.displayAvatarURL({ format: 'png', size: 2048 });
            const response = await axios.get(currentAvatar, {
                responseType: 'arraybuffer'
            });
            const buffer = Buffer.from(response.data, 'binary');
            fs.writeFileSync(originalAvatarPath, buffer);

            const newAvatar = userMention.displayAvatarURL({ format: 'png', size: 2048 });
            const newAvatarResponse = await axios.get(newAvatar, {
                responseType: 'arraybuffer'
            });
            const newAvatarBuffer = Buffer.from(newAvatarResponse.data, 'binary');
            await client.user.setAvatar(newAvatarBuffer);
            await send(message, '프로필 사진 변경 성공!');
        } catch (error) {
            await send(message, `프로필 사진 변경 실패: ${error.message}`);
        }
    } else if (message.content.startsWith('!복구')) {
        try {
            const originalAvatarBuffer = fs.readFileSync(originalAvatarPath);
            await client.user.setAvatar(originalAvatarBuffer);
            await send(message, '원래의 프로필 사진으로 복구 완료!');
        } catch (error) {
            await send(message, `프로필 사진 복구 실패: ${error.message}`);
        }
    }
});


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (fs.existsSync('token.json')) {
    const tokenData = JSON.parse(fs.readFileSync('token.json', 'utf8'));
    client.login(tokenData.token).catch(() => {
        console.log('올바르지 않은 토큰입니다!');
        requestToken();
    });
} else {
    requestToken();
}

function requestToken() {
    rl.question('토큰을 입력해주세요: ', (token) => {
        client.login(token)
            .then(() => {
                fs.writeFileSync('token.json', JSON.stringify({ token: token }), 'utf8');
                rl.close();
            })
            .catch(() => {
                console.log('올바르지 않은 토큰입니다!');
                requestToken();
            });
    });
}
