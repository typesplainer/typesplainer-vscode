// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const LRUCache = require('lru-cache-js-map');
var compare = require('node-version-compare');

let cache = new LRUCache(100);
let requiredTypesplainerVersion = "0.2.0"
let pythonPath: string;

export interface Typesplanation {
	typehint_text: string;
	description:   string;
	line:          number;
	end_line:      number;
	column:        number;
	end_column:    number;
}

async function getTypesplanationForFile(pythonPath: string, filePath: string, textContent: string): Promise<Typesplanation[] | false>{

	let fromCache = cache.get(textContent);
	if (fromCache !== -1){
		return fromCache;
	}
	const command = `${pythonPath} -m typesplainer "${filePath}" --json`;
	let output;
	try{
		output = await exec(command);
	}catch (err: any) {
		if (err.message.includes("No module named typesplainer" )){
			vscode.window
			.showWarningMessage("Could not find typesplainer, consider installing typesplainer by using pip install typesplainer", "Install typesplainer")
			.then(async (selection) => {
				if (selection === "Install typesplainer"){
					const command = `${pythonPath} -m pip install typesplainer`;
					try{
						 await exec(command);
						vscode.window.showInformationMessage("typesplainer installed successfully")
					}catch (err) {
						vscode.window.showWarningMessage("Could not install typesplainer, consider installing typesplainer manually")
					}
				};
			});
		}else{
			// node couldn't execute the command for some reason
			vscode.window.showErrorMessage("Typesplainer: Could not execute command. Please open an issue on https://github.com/wasi-master/typesplainer-vscode");
			console.error(err);
			return false;
		}
	}
	let { stdout, stderr } = output;
	if (stderr){
		// command errored out
		vscode.window.showErrorMessage("Typesplainer: Command raised an error. Please open an issue on https://github.com/wasi-master/typesplainer-vscode");
		console.error(stderr)
		return false;
	}
	let results = JSON.parse(stdout);
	cache.put(textContent, results);
	return results;
}
class TypesplainerHoverProvider implements vscode.HoverProvider {
    async provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | null> {
        const output = await getTypesplanationForFile(pythonPath, document.uri.fsPath, document.getText());
		if (output === false) {
			return null;
		}
		for (let type of output){
			if (position.line + 1>= type.line && position.line + 1 <= type.end_line) {
				if (position.character >= type.column && position.character <= type.end_column) {
					return new vscode.Hover(`🌟 **Typesplanation**: ${type.description}\n\n👉 **For**: \`${type.typehint_text}\``);
				}
			}
		}
		return null;
    }
}

// this method is called when the extension is activated
export async function activate(context: vscode.ExtensionContext) {
	// Loading settings
	const config = vscode.workspace.getConfiguration("typesplainer");
	const customPythonPath: any = config.get("pythonPath");
	let typesplainerVersion: string;
	pythonPath = customPythonPath || vscode.workspace.getConfiguration("python").get("pythonPath") || vscode.workspace.getConfiguration("python").get("defaultInterpreterPath") || process.env.PYTHONPATH;

	vscode.languages.registerHoverProvider('python', new TypesplainerHoverProvider())

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		console.error('Typesplainer: Could not find an active editor');
		return false;
	}
	if (!pythonPath) {
		vscode.window.showErrorMessage("Typesplainer: Python path not found. Consider setting the PYTHONPATH environment variable, or configure the setting typesplainer.pythonPath");
	}
	try{
		const command = `${pythonPath} -m typesplainer --version`;
		let {stdout} =  await exec(command);
		typesplainerVersion = stdout.match(new RegExp("typesplainer ((?:\\d+\\.)?(?:\\d+\\.)?(?:\\*|\\d+))"))[1];
		if (compare(typesplainerVersion, requiredTypesplainerVersion) === -1){
			vscode.window
			.showWarningMessage("typesplainer verison too low, consider updating typesplainer by using pip install -U typesplainer", "Update typesplainer")
			.then(async (selection) => {
				if (selection === "Update typesplainer"){
					const command = `${pythonPath} -m pip install -U typesplainer`;
					try{
						await exec(command);
						vscode.window.showInformationMessage("typesplainer updated successfully")
					}catch (err) {
						vscode.window.showWarningMessage("Could not install typesplainer, consider installing typesplainer manually")
					}
				};
			});
		}
	}catch(err){
		console.error(err)
		vscode.window
			.showErrorMessage(`Typesplainer: Could not automatically get typesplainer version, make sure you have typesplainer version ${requiredTypesplainerVersion} or higher installed`, "Install or Update typesplainer")
			.then(async (selection) => {
				if (selection === "Install or Update typesplainer"){
					const command = `${pythonPath} -m pip install -U typesplainer`;
					try{
						await exec(command);
						vscode.window.showInformationMessage("typesplainer installed or updated successfully")
					}catch (err) {
						vscode.window.showWarningMessage("Could not install typesplainer, consider installing typesplainer manually")
					}
				}
			});
	}
	let disposable = vscode.commands.registerCommand('typesplainer.openWebsite', () => {
		vscode.env.openExternal(vscode.Uri.parse('https://typesplainer.herokuapp.com/'));
	});
	let disposable_ = vscode.commands.registerCommand('typesplainer.clearCache', () => {
		cache = new LRUCache(100);
	});


	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable_);
}

