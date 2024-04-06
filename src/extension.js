const vscode = require('vscode');
const exmlComp = require('./exmlComp');
const fs = require('fs');


function activate(context) {
    console.log('Congratulations, your extension "helloworld-sample" is now active!');
    let disposable = vscode.commands.registerCommand('extension.translateExMLToHTML', () => {
        vscode.window.showInformationMessage('Translating EXML to HTML....');
        const doc = vscode.window.activeTextEditor.document;
        let txt =  doc.getText();
        txt = exmlComp.translate(txt);
        fs.writeFileSync(doc.fileName.split(".exml").join(".html"), txt);
        vscode.window.showInformationMessage('ExML => HTML File was written!');
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
	activate,
	deactivate
}