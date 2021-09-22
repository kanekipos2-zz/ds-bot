const
    yts = require('yt-search'),
    music = require('../music'),
    { client } = require('../main'),
    config = require('../config.json');

var isBlowing = false;

module.exports = 
{
    text_name: ['blow'],
    voice_name: ['взрыв', 'blow', 'разрывная'],
    description: 'Взрыв.', 
    args_text(args, message) 
    {
        blow(message.member);
        message.delete();
    },
    args_voice(voiceMessage, args)
    {
        blow(voiceMessage.member);
    }   
}

async function blow(member)
{
    if(!member.voice) {return;}
    if(isBlowing) {return;}
    if(music.isPlaying()) {return;}
    isBlowing = true;
    var ch1 = await member.voice.channel;
    client.voice.connections.first().play('C:/Users/Mihail/Desktop/nana-bot/music/blow.mp3', {volume: 2});
    setTimeout(async function(){
        await client.voice.connections.first().disconnect();
        var ch2 = await ch1.clone();
        ch2.setPosition(ch1.rawPosition);
        await ch1.delete();
        ch2.join();
        isBlowing = false;
    }, 2500);
}