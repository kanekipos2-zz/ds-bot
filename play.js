const
    yts = require('yt-search'),
    music = require('../music'),
    { client } = require('../main'),
    config = require('../config.json');

module.exports = 
{
    text_name: ['play'],
    voice_name: ['включи', 'вруби', 'врубить', 'подруби', 'подруги'],
    description: 'Добавляет в очередь первый найденый трек.', 
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
    srtd[0].type == 'video'? 
        music.addTrack(srtd[0].url, srtd[0].title, srtd[0].author.name, srtd[0].timestamp, srtd[0].seconds, srtd[0].thumbnail) : 
        music.addLive(srtd[0].url, srtd[0].title, srtd[0].author.name, srtd[0].thumbnail);
}