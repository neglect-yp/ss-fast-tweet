'use strict'

const {ipcRenderer} = require('electron');
const $ = require('jQuery');

var ss;
var counter;
var tweettext;
window.onload = () => {
	ss = document.getElementById('screenshot');
	counter = document.getElementById('counter');
	tweettext = document.getElementById('tweettext');
}

function changeCounter(obj) {
	var len = 140 - obj.value.length;
	counter.innerHTML = len;
	if (len < 0) {
		counter.style.color = "red";
	} else {
		counter.style.color = "black";
	}
}

// 画面が表示されたら、スクリーンショットを最新のものに変更し、textareaにフォーカスする。
ipcRenderer.on('screenshot', (event, message) => {
	ss.src = message;
	document.tweet.tweettext.focus();
});

// (Ctrl|Command)+Enterが押されたら、ツイートしてtextareaをクリア
$(function($){
	$(window).keydown(function(e){
		if (event.ctrlKey | event.metaKey) {
			if (e.keyCode === 13) {
				ipcRenderer.send('tweet', tweettext.value);
				tweettext.value = "";
				changeCounter(tweettext.value);
				return false;
			}
		}
	});
});
