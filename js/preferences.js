'use strict';

const {ipcRenderer, remote} = require('electron');
const $ = require('jQuery');

function closeWindow() {
	var win = remote.getCurrentWindow();
	win.close();
}

window.onload = () => {
	var sspath = document.getElementById('sspath');
	var sspath_text = document.getElementById('sspath-text');
	var del_checkbox = document.getElementById('delete');

	sspath.addEventListener('change', () => {
		sspath_text.value = sspath.files[0].path;
	});

	document.getElementById('apply-button').addEventListener('click', () => {
		ipcRenderer.send('set-config', sspath_text.value, del_checkbox.checked);
		closeWindow();
	});

	document.getElementById('cancel-button').addEventListener('click', () => {
		closeWindow();
	});

	ipcRenderer.send('get-config');

	ipcRenderer.on('get-config-reply', (event, path, del) => {
		sspath_text.value = path;
		del_checkbox.checked = del;
	});
}

