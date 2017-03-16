'use strict'

const {ipcRenderer, remote} = require('electron');
const {Menu, MenuItem} = remote;
const $ = require('jQuery');

// コンテキストメニュー
const menu = new Menu();
menu.append(new MenuItem({label: 'Preferences', click() { showPreferences(); }}));

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);

// htmlタグの要素を取得
let ss;
window.onload = () => {
	ss = document.getElementById('screenshot');
	const counter = document.getElementById('counter');
	const tweettext = document.getElementById('tweettext');

	// 文字数カウント
	tweettext.addEventListener('keyup', () => {
		const len = 140 - tweettext.value.length;
		counter.innerHTML = len;
		if (len < 0) {
			counter.style.color = "red";
		} else {
			counter.style.color = "black";
		}
	});
}

function showPreferences() {
	ipcRenderer.send('show-preferences');
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
