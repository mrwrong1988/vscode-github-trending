// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RepoNodeProvider } from './repos';
import {REPO_SINCE, REPO_LANGUAGE, REPO_SPOKEN_LANGUAGE, sinces, languages, spokenLanguages} from './conditions';
import { Telemetry } from './embedded-browser/telemetry';
import { BrowserViewWindowManager } from './embedded-browser/BrowserViewWindowManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const nodeReposProvider = new RepoNodeProvider(context);
	vscode.window.registerTreeDataProvider('nodeRepos', nodeReposProvider);

	const telemetry = new Telemetry();
	const windowManager = new BrowserViewWindowManager(context.extensionPath, telemetry);

	telemetry.sendEvent('activate');

	context.subscriptions.push(
		vscode.commands.registerCommand('nodeRepos.refreshEntry', () => nodeReposProvider.refresh()),
		vscode.commands.registerCommand('nodeRepos.since', async () => {
			const since = await vscode.window.showQuickPick(sinces);
			context.globalState.update(REPO_SINCE, since);
			nodeReposProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeRepos.language', async () => {
			const language = await vscode.window.showQuickPick(languages);
			context.globalState.update(REPO_LANGUAGE, language);
			nodeReposProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeRepos.spokenLanguage', async () => {
			const spokenLanguage = await vscode.window.showQuickPick(spokenLanguages);
			context.globalState.update(REPO_SPOKEN_LANGUAGE, spokenLanguage);
			nodeReposProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeRepos.view', (name, url) => {
			console.log(name, url);
			telemetry.sendEvent('openPreview');
      windowManager.create(url);
		}),
	);
}

export function deactivate() {}
