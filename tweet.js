var twitter = require('twitter');
var fs = require('fs');

var client = new twitter({
    consumer_key:        process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
    access_token_key:    process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var params = {screen_name: 'nodejs'};

// 画像ツイート
exports.tweet = function(text, imgpath) {
	var data = fs.readFileSync(imgpath);
	client.post('media/upload', {media: data}, (error, media, response) => {
		if (!error) {
			var status = {
				status: text,
				media_ids: media.media_id_string
			}

			client.post('statuses/update', status, (error, tweet, response) => {
				if (!error) console.log(tweet);
			});
		}
	});
};
