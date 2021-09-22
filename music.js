const
    discord = require('discord.js'),
    main = require('./main'),
    config = require('./config.json'),
    client = main.client,
    ytdl = require('discord-ytdl-core');

var queue = [];
var isPlaying = false;
var dispatcher;
var playerObj = false;
var prevSeek = 0;
var message;
var timerHandler;
var emojiCollector;
var isNc = false;
var isBB = false;

function addTrack(url, title, author, timestamp, seconds, thumbnail)
{
    queue.push({url: url, title: title, author: author, timestamp: timestamp, seconds: seconds, thumbnail: thumbnail})
    play();
}

function addLive(url, title, author, thumbnail)
{
    queue.push({url: url, title: title, author: author, thumbnail: thumbnail, live: true});
    play();
}

function play(seek, bb = false, nc = false)
{
    isNc = nc;
    isBB = bb;
    if(isPlaying && !seek) return;
    isPlaying = true;
    if(!playerObj) player.start();
    let connection = client.voice.connections.first();
    prevSeek = seek? seek : 0;
    if((!bb && !nc) || queue[0].live) dispatcher = connection.play(ytdl(queue[0].url, {filter: queue[0].live? 'audio' : 'audioonly', quality: 'highestaudio', opusEncoded: true, seek: seek}), {type: 'opus', volume: 1});
    else if(nc) dispatcher = connection.play(ytdl(queue[0].url, {filter: queue[0].live? 'audio' : 'audioonly', quality: 'highestaudio', opusEncoded: true, seek: seek, encoderArgs: ["-af", "asetrate=44100*1.5,bass=g=12,dynaudnorm=f=200"]}), {type: 'opus', volume: 1.5});
    else if(bb)dispatcher =  connection.play(ytdl(queue[0].url, {filter: queue[0].live? 'audio' : 'audioonly', quality: 'highestaudio', opusEncoded: true, seek: seek, encoderArgs: ["-af", "bass=g=18,dynaudnorm=f=400"]}), {type: 'opus', volume: 7});
    dispatcher.on('finish', () => {
        isPlaying = false;
        prevSeek = 0;
        try {
        if(message.reactions.resolve('🔂').count > 1) queue.unshift(queue[0]);
        if(message.reactions.resolve('🔀').count > 1)
        {
            let index = Math.floor(Math.random() * queue.length);
            queue.unshift(queue[index]);
            queue.splice(index+1, 1);
        }   } catch(err) {}
        queue.shift();
        if(queue[0]) play(0, isBB, isNc);
        else player.stop();
    })
    dispatcher.on('error', () => {
        client.channels.fetch(config.nana_channel_id).then(nanaChannel => {
            nanaChannel.send(`Не могу воспроизвести трек ${queue[0].title}  ¯\\_(ツ)_/¯`).then(message => {setTimeout(function(){message.delete()}, 8000)});
            dispatcher.end();
        })
    })
}

function skip()
{
    if(!queue[0])
    {
        require('./main').nanaChannel.send('Нет треков в очереди.').then(message => {setTimeout(function() {message.delete()}, 8000)});
        return;
    }
    dispatcher.end();
}

function seek(time)
{
    let args = time.split(':').reverse();
    let t = 0;
    for(let i in args)
    {
        let n = parseInt(args[i]);
        if(!n && n!=0)
        {
            require('./main').nanaChannel.send('Неправильно указано время.').then(message => {setTimeout(function(){message.delete()}, 8000)})
            return;
        }
        t += n* Math.pow(60, i);
    }
    if(t < 0 || t > queue[0].seconds-2)
    {
        require('./main').nanaChannel.send('Неправильно указано время.').then(message => {setTimeout(function(){message.delete()}, 8000)})
        return;
    }
    if(t == 0) t=1;
    if(isBB) play(t, true, false);
    else if(isNc) {require('./main').nanaChannel.send('При включенном найткоре не стоит seek использовать, в пизду.').then(message => {setTimeout(function(){message.delete()}, 8000)})}
    else play(t);

}

class player
{
    static start()
    {
        playerObj = true;
        let nanaChannel = require('./main').client.channels.fetch(config.nana_channel_id).then(nanaChannel => {
            nanaChannel.send(embedBuilder(0)).then(msg => {
                message = msg;
                emojiSetup();
                timerHandler = setInterval(this._exec, 2500);
            })
        });
    }
    static stop()
    {
        clearInterval(timerHandler);
        message.delete();
        playerObj = false;
    }
    static _exec()
    {
        message.edit(embedBuilder(dispatcher.streamTime / 1000 + prevSeek));
    }
}

async function emojiSetup()
{
    await message.react('🔀');
    await message.react('⏸️');
    await message.react('🔂');
    await message.react('📶');
    await message.react('⤴️');
    await message.react('⏩');
    emojiCollector = new discord.ReactionCollector(message, function(reaction){return reaction.count > 1; }, {dispose: true})
    
    emojiCollector.on('collect', (reaction, user) => {
        switch(reaction.emoji.name)
        {
            case '⏸️':
                dispatcher.pause();
                break;
            case '📶':
                play(parseInt(dispatcher.streamTime / 1000 + prevSeek), true, false);
                break;
            case '⤴️':
                play(parseInt(dispatcher.streamTime / 1000 + prevSeek), false, true);
                break;
            case '⏩':
                skip();
                message.reactions.resolve('⏩').remove();
                message.react('⏩')
                break;
        }
    })

    emojiCollector.on('remove', (reaction, user) => {
        switch(reaction.emoji.name)
        {
            case '⏸️':
                dispatcher.resume();
                break;
            case '📶':
                play(parseInt(dispatcher.streamTime / 1000 + prevSeek));
                break;
            case '⤴️':
                play(parseInt(dispatcher.streamTime / 1000 + prevSeek));
                break;
        }
    })
}

function embedBuilder(time)
{
    var embed = new discord.MessageEmbed()
        .setColor('#e3bbff')
        .addField(
            `Играет ${queue[0].title} от ${queue[0].author}`,
            `${timeLine()}`
        )
        .addField(
            'Очередь: ',
            queueBuilder()
        )

    return embed;

    function timeLine()
    {
        if(queue[0].live) return(`Live video. Длительность прослушивания: ${timeConverter(Math.floor(time))}`);
        let total_tires = config.player_timeline_size;
        let current_pos = Math.floor(total_tires * time / queue[0].seconds);
        var r = `(${timeConverter(Math.floor(time))}) ${'―'.repeat(current_pos)}●${'―'.repeat(total_tires-current_pos-1)}ᐅ (${queue[0].timestamp})`;
        return r;
    }

    function timeConverter(s) 
    {
    let hours = Math.floor(s / 3600);
    let mins = Math.floor(s % 3600 / 60);
    let secs = s % 60;
    return(`${hours > 0? hours + ':' : ''}${hours>0 && mins < 10? '0'+mins : mins}:${secs < 10? '0'+secs : secs}`);
    }

    function queueBuilder()
    {
        s = '';
        for(let i = 0; i < queue.length; i++)
        {
            s += `${i+1}. ${queue[i].title} (${queue[i].live? 'LIVE' : queue[i].timestamp})\n`;
        }
        return s;
    }

}

function getIsPlaying()
{
    return isPlaying;
}

module.exports.addTrack = addTrack;
module.exports.addLive = addLive;
module.exports.skip = skip;
module.exports.seek = seek;
module.exports.isPlaying = getIsPlaying;