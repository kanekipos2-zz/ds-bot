const 
    { client } = require("../main"),
    music = require('../music'),
    config = require('../config.json');

module.exports = 
{
    text_name: ['join'],
    voice_name: [],
    description: 'Присоедениться к каналу.', 
    args_text(args, message) 
    {
        if(music.isPlaying()) {client.channels.fetch(config.nana_channel_id).then(ch => {ch.send('Не могу присоедениться, играет музыка.').then(msg => {setTimeout(function(){msg.delete()}, 8000)})}); message.delete(); return;}
        if(client.voice.connections.first()) client.voice.connections.first().disconnect();
        setTimeout(function(){message.member.voice.channel.join()}, 2000);
        message.delete();
    },
    args_voice(voiceMessage, args){}
}