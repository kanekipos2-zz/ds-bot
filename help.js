const 
    Discord = require('discord.js'),
    commands = require('../commands-handler').commands,
    { client } = require('../main'),
    config = require('../config.json');

module.exports = 
{
    text_name: ['help'],
    voice_name: ['help'],
    description: 'Помощь по командам бота.', 
    args_text(args, message) 
    {
        main(message.channel);
        message.delete();
    },
    args_voice(voiceMessage, args)
    {
        client.channels.fetch(config.nana_channel_id).then(channel => {main(channel);})
    }
}

function main(channel)
{
    const embed = new Discord.MessageEmbed()
        .setColor('#F787F1')
        .setTitle('Помощь по командам бота.');
    for(let i of commands) embed.addField(`t: ${i.text_name[0]}  | v: ${i.voice_name[0]}`, i.description, false);
    channel.send(embed).then(message => {setTimeout(function() {message.delete()}, 15000)});
}