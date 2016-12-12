'use strict'

const {app, BrowserWindow, Tray, ipcMain} = require('electron');
const {exec} = require('child_process');
const tweet = require('./tweet.js');

let tray = null;

app.on('window-all-closed', () => {
	app.quit();
});

app.on('ready', () => {
	var ssPath;

	tray = new Tray(__dirname + '/image/icon.png');
	tray.window = new BrowserWindow({
		width:800,
		height:700,
		frame:false,
		show:false,
		backgroundColor: '#307cb7'
	});
	tray.window.loadURL('file://' + __dirname + '/index.html');
	app.dock.hide();

	tray.on('click', () => {
		tray.window.isVisible() ? tray.window.hide() : tray.window.show();
	});
	tray.on('double-click', () => {
		tray.window.isVisible() ? tray.window.hide() : tray.window.show();
	});

	tray.window.on('show', () => {
		tray.setHighlightMode('always');

		// スクリーンショットディレクトリのパスをssPathに保存
		exec('defaults read com.apple.screencapture location', (err, stdout, stderr) => {
			ssPath = stdout.replace(/\n/g,"");
			// 最新のスクリーンショットのパスをレンダラプロセスに送信
			exec('ls -t ' + ssPath + ' | head -n 1', (err, stdout, stderr) => {
				ssPath += '/' + stdout.replace(/\n/g,"");
				err ? console.log(err) : tray.window.webContents.send('screenshot', ssPath);
			});
		});
	});
	tray.window.on('hide', () => {
		tray.setHighlightMode('never');
	});

	// ツイートがレンダラプロセスから飛んできたら、ツイートするとともにウィンドウを隠す
	ipcMain.on('tweet', (event, arg) => {
		tweet.tweet(arg, ssPath);
		tray.window.hide();
	});
});

