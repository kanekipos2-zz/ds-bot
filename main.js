const 
    config = require('./config.json'),
    discord = require('discord.js'),   // docs: https://discord.js.org/#/docs/main/12.5.3/general/welcome
    client = new discord.Client(),
    commandshelper = require('./commands-handler'),
    {DiscordSR, resolveSpeechWithGoogleSpeechV2} = require('discord-speech-recognition');

const dSR = new DiscordSR(client, {'lang': 'ru-RU', 'speechRecognition': resolveSpeechWithGoogleSpeechV2});

client.login(config.bot_token);

client.on('ready', () => {
    commandshelper.registerCommands();
    console.log('Nana bot v2 is ready.');
    //client.generateInvite(["ADMINISTRATOR"]).then(link => {console.log(link);})
})

client.on('message', message => {
    if( (message.channel.id != config.nana_channel_id) || message.author.bot) return;
    let args = message.content.toLowerCase().split(' ');
    commandshelper.exec.text_cmd(args[0], args.splice(1), message);
})

/*client.on('voiceStateUpdate', async function(oldState, newState) {
    if(oldState.id == client.user.id && newState.channel) return;
    let states = oldState.guild.channels.cache;
    let maxUsers = 0;
    let maxChannel = null;
    for(let i of states) 
    {
        if(i[1].type == 'voice')
        {
            if(!maxChannel) maxChannel = await client.channels.fetch(i[0]);
            let mmbrCount = i[1].members.size;
            if(i[1].id == client.voice.connections.first().channel) {mmbrCount -= 1;}
            if(mmbrCount > maxUsers)
            {
                maxChannel = await client.channels.fetch(i[0]);
                maxUsers = mmbrCount;
            }
        }
    }
    maxChannel.join();
})*/

client.on('speech', message => {
    if(message.author.tag == '4406') return;
    let Data =  new Date();
    if(message.content) console.log(`[${Data.getHours()}:${Data.getMinutes()}:${Data.getSeconds()}] ${message.author.username}: ${message.content}`);
    if(message.content) commandshelper.exec.voice_cmd(message);
});

module.exports.client = client;