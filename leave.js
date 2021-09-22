const 
    { client } = require("../main"),
    music = require('../music'),
    config = require('../config.json');

module.exports = 
{
    text_name: ['leave'],
    voice_name: ['leave', 'выйди', 'выйти'],
    description: 'Выйти из канала.', 
    args_text(args, message) 
    {
        if(!client.voice.connections.first()) {client.channels.fetch(config.nana_channel_id).then(ch => {ch.send('Откуда ливать то блять?').then(msg => {setTimeout(function(){msg.delete()}, 8000)})});message.delete(); return;}
        if(music.isPlaying()) {client.channels.fetch(config.nana_channel_id).then(ch => {ch.send('Не могу отсоединиться, играет музыка.').then(msg => {setTimeout(function(){msg.delete()}, 8000)});}); message.delete(); return;}
        client.voice.connections.first().disconnect();
        message.delete();
    },
    args_voice(voiceMessage, args){}
}