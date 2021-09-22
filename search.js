const { MessageEmbed, ReactionCollector } = require('discord.js');
const
    yts = require('yt-search'),
    music = require('../music'),
    { client } = require('../main'),
    config = require('../config.json');

module.exports = 
{
    text_name: ['search'],
    voice_name: ['ищи', 'найди'],
    description: 'Ищет трек из пяти.', 
    args_text(args, message) 
    {
        search(args.join(' '));
        message.delete();
    },
    args_voice(voiceMessage, args)
    {
        search(args.join(' '));
    }   
}

async function search(text)
{
    var results = await yts(text);
    let srtd = results.all.filter(function(rslt) {return(rslt.type == 'video' || rslt.type == 'live')})
    if(!srtd[0]) 
    {
        client.channels.fetch(config.nana_channel_id).then(channel => {channel.send('Нет результатов поиска.').then(message => {setTimeout(function(){message.delete()}, 8000)})});
        return;
    }
    if(!client.voice.connections.first()) {
        client.channels.fetch(config.nana_channel_id).then(channel => {channel.send('Не присоединён к каналу. Join?.').then(message => {setTimeout(function(){message.delete()}, 8000)})});
        return;
    }
    srtd = srtd.splice(0, 5);
    let embed = new MessageEmbed()
        .setColor('#e3bbff')
        .addField('Результаты поиска.', searchBuilder());
    client.channels.fetch(config.nana_channel_id).then(channel => {channel.send(embed).then(message => {
            let reactions = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
            for(let i in srtd)
            {
                message.react(reactions[i]);
            }
            message.react('❎');
            let rCollector = new ReactionCollector(message, function(r){return r.count != 1});
            rCollector.on('collect', (r, user) => {
                switch(r.emoji.name)
                {
                    case '1️⃣':
                        if(srtd[0].type == 'video') music.addTrack(srtd[0].url, srtd[0].title, srtd[0].author.name, srtd[0].timestamp, srtd[0].seconds, srtd[0].thumbnail);
                        else music.addLive(srtd[0].url, srtd[0].title, srtd[0].author.name, srtd[0].thumbnail);
                        message.delete();
                        return;
                    case '2️⃣':
                        if(srtd[1].type == 'video') music.addTrack(srtd[1].url, srtd[1].title, srtd[1].author.name, srtd[1].timestamp, srtd[1].seconds, srtd[1].thumbnail);
                        else music.addLive(srtd[1].url, srtd[1].title, srtd[1].author.name, srtd[1].thumbnail);
                        message.delete();
                        return;
                    case '3️⃣':
                        if(srtd[2].type == 'video') music.addTrack(srtd[2].url, srtd[2].title, srtd[2].author.name, srtd[2].timestamp, srtd[2].seconds, srtd[2].thumbnail);
                        else music.addLive(srtd[2].url, srtd[2].title, srtd[2].author.name, srtd[2].thumbnail);
                        message.delete();
                        return;
                    case '4️⃣':
                        if(srtd[3].type == 'video') music.addTrack(srtd[3].url, srtd[3].title, srtd[3].author.name, srtd[3].timestamp, srtd[3].seconds, srtd[3].thumbnail);
                        else music.addLive(srtd[3].url, srtd[3].title, srtd[3].author.name, srtd[3].thumbnail);
                        message.delete();
                        return;
                    case '5️⃣':
                        if(srtd[4].type == 'video') music.addTrack(srtd[4].url, srtd[4].title, srtd[4].author.name, srtd[4].timestamp, srtd[4].seconds, srtd[4].thumbnail);
                        else music.addLive(srtd[4].url, srtd[4].title, srtd[4].author.name, srtd[4].thumbnail);
                        message.delete();
                        return;
                    case '❎':
                        message.delete();
                        return;
                }
            })
    })});
        
    function searchBuilder()
    {
        let str = '';
        for(let i2 in srtd)
        {
            str += `${parseInt(i2)+1}. ${srtd[i2].title} (${srtd[i2].timestamp? srtd[i2].timestamp : 'LIVE'})\n`
        }
        return str;
    } 
}