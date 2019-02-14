"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // var WordCounter = require('./components/wordCounter');
    // var counter = new WordCounter(vscode);
    // context.subscriptions.push(counter);
    var GetDtoJson = require('./components/getDtoJson');
    var json = new GetDtoJson(vscode);
    context.subscriptions.push(vscode.commands.registerCommand('extension.dfxk', function () {
        json.initialize();
    }));
    context.subscriptions.push(json.watch());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map