'use strict'

const {app, BrowserWindow, Tray, Menu, ipcMain} = require('electron');
const {execSync} = require('child_process');
const fs = require('fs');
const storage = require('electron-json-storage');
const tweet = require('./tweet.js');

let tray = null;
let preferencesWindow = null;

// ディレクトリ内の最新のスクリーンショットのパスをレンダラプロセスに送信
function sendScreenShotPath(dirpath) {
	const output = execSync(`ls -t ${dirpath} | head -n 1`).toString();
	const filepath = `${dirpath}/` + output.replace(/\n/g, '');
	console.log(filepath);
	tray.window.webContents.send('screenshot', filepath);

	return filepath;
}

function createPreferencesWindow() {
	if (preferencesWindow !== null)
		return;

	preferencesWindow = new BrowserWindow({
		parent:tray.window,
		width:300,
		height:150,
		frame:false,
		resizable:false
	});

	preferencesWindow.loadURL(`file://${__dirname}/preferences.html`);

	preferencesWindow.on('closed', () => {
		preferencesWindow = null;
	});
}

app.on('window-all-closed', () => {
	app.quit();
});

app.on('ready', () => {
	let ssdirpath;
	let isdelchecked;
	let sspath;

	// メインウィンドウの生成
	tray = new Tray(`${__dirname}/image/icon.png`);
	tray.window = new BrowserWindow({
		width:800,
		height:700,
		frame:false,
		show:false,
		backgroundColor: '#307cb7',
		resizable:false
	});
	tray.window.loadURL(`file://${__dirname}/index.html`);

	// dockにアイコンを表示しないようにする
	app.dock.hide();

	// configの読み込み
	storage.get('config', function (error, data) {
		if (error) throw error;

		if (Object.keys(data).length === 0) {
			//TODO
		} else {
			ssdirpath = data['path'];
			isdelchecked = data['del'];
		}
	});

	// メニューバーのアイコンをクリックするとウィンドウを表示/非表示
	tray.on('click', () => {
		tray.window.isVisible() ? tray.window.hide() : tray.window.show();
	});
	tray.on('double-click', () => {
		tray.window.isVisible() ? tray.window.hide() : tray.window.show();
	});

	tray.window.on('show', () => {
		tray.setHighlightMode('always');
		sspath = sendScreenShotPath(ssdirpath);
	});

	tray.window.on('hide', () => {
		tray.setHighlightMode('never');

		if (preferencesWindow !== null) {
			preferencesWindow.close();
			preferencesWindow = null;
		}
	});

	// ツイートがレンダラプロセスから飛んできたら、ツイートするとともにウィンドウを隠す
	ipcMain.on('tweet', (event, text) => {
		tweet.tweet(text, sspath);
		tray.window.hide();
		if (isdelchecked) {
			fs.unlink(sspath, (err) => {
				if (err) throw err;
				console.log(`Deleted ${sspath}`);
			});
		}
	});

	// 環境設定ウィンドウを表示する
	ipcMain.on('show-preferences', (event) => {
		createPreferencesWindow();
	});

	ipcMain.on('get-config', (event) => {
		preferencesWindow.webContents.send('get-config-reply', ssdirpath, isdelchecked);
	});

	ipcMain.on('set-config', (event, path, del) => {
		ssdirpath = path;
		isdelchecked = del;
		
		// コンフィグをjsonファイルに保存
		const json = {
			path: path,
			del: del
		};
		storage.set('config', json, function (error) {
			if (error) throw error;
		});
	});
});

