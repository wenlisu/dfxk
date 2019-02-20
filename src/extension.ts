// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// var WordCounter = require('./components/wordCounter');
	// var counter = new WordCounter(vscode);
	// context.subscriptions.push(counter);
	var GetDtoJson = require('./components/getDtoJson');
	var json = new GetDtoJson(vscode);

	context.subscriptions.push(vscode.commands.registerCommand('extension.dfxk', function () {
		json.extension();
	}));
	context.subscriptions.push(json.watch());
}

// this method is called when your extension is deactivated
export function deactivate() {}
