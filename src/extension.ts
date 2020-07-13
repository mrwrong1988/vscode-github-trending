// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RepoNodeProvider } from './repos';
import { UserNodeProvider } from './users';
import { LikedNodeProvider, LikeDetail } from './liked';
import {sinces, languages, spokenLanguages} from './conditions';
import {StroageKey} from './storage';
import { Telemetry } from './embedded-browser/telemetry';
import { BrowserViewWindowManager } from './embedded-browser/BrowserViewWindowManager';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const nodeRepoProvider = new RepoNodeProvider(context);
	vscode.window.registerTreeDataProvider('nodeRepos', nodeRepoProvider);

	const nodeUserProvider = new UserNodeProvider(context);
	vscode.window.registerTreeDataProvider('nodeUsers', nodeUserProvider);

	const nodeLikedProvider = new LikedNodeProvider(context);
	vscode.window.registerTreeDataProvider('nodeLiked', nodeLikedProvider);

	const telemetry = new Telemetry();
	const windowManager = new BrowserViewWindowManager(context.extensionPath, telemetry);

	telemetry.sendEvent('activate');

	context.subscriptions.push(
		vscode.commands.registerCommand('nodeRepos.refreshEntry', () => nodeRepoProvider.refresh()),
		vscode.commands.registerCommand('nodeRepos.since', async () => {
			const current = context.globalState.get<string>(StroageKey.REPO_SINCE);
			const since = await vscode.window.showQuickPick(sinces, {placeHolder: current});
			context.globalState.update(StroageKey.REPO_SINCE, since || current);
			nodeRepoProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeRepos.language', async () => {
			const current = context.globalState.get<string>(StroageKey.REPO_LANGUAGE);
			const language = await vscode.window.showQuickPick(languages, { placeHolder: current});
			context.globalState.update(StroageKey.REPO_LANGUAGE, language || current);
			nodeRepoProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeRepos.spokenLanguage', async () => {
			const current = context.globalState.get<string>(StroageKey.REPO_SPOKEN_LANGUAGE);
			const spokenLanguage = await vscode.window.showQuickPick(spokenLanguages, {placeHolder: current});
			context.globalState.update(StroageKey.REPO_SPOKEN_LANGUAGE, spokenLanguage || current);
			nodeRepoProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeUsers.refreshEntry', () => nodeUserProvider.refresh()),
		vscode.commands.registerCommand('nodeUsers.since', async () => {
			const current = context.globalState.get<string>(StroageKey.USER_SINCE);
			const since = await vscode.window.showQuickPick(sinces, {placeHolder: current});
			context.globalState.update(StroageKey.USER_SINCE, since || current);
			nodeUserProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeUsers.language', async () => {
			const current = context.globalState.get<string>(StroageKey.USER_LANGUAGE);
			const language = await vscode.window.showQuickPick(languages, {placeHolder: current});
			context.globalState.update(StroageKey.USER_LANGUAGE, language || current);
			nodeUserProvider.refresh();
		}),
		vscode.commands.registerCommand('nodeLiked.refreshEntry', () => nodeLikedProvider.refresh()),
		vscode.commands.registerCommand('githubTrending.open', (url, name) => {
			telemetry.sendEvent('openPreview');
      windowManager.create(url);
		}),
		vscode.commands.registerCommand('githubTrending.like', (item) => {
			let likeList = context.globalState.get<LikeDetail[]>(StroageKey.LIKE) || ([] as LikeDetail[]);
			likeList = [{name: item.detail.name, url: item.detail.url, avatar: item.detail.url}, ...likeList];
			context.globalState.update(StroageKey.LIKE, likeList);
			nodeLikedProvider.refresh();
			nodeRepoProvider.refresh();
			nodeUserProvider.refresh();
		}),
		vscode.commands.registerCommand('githubTrending.unlike', (item) => {
			let likeList = context.globalState.get<LikeDetail[]>(StroageKey.LIKE) || ([] as LikeDetail[]);
			likeList = likeList.filter(({url}) => url !== item.detail.url);
			context.globalState.update(StroageKey.LIKE, likeList);
			nodeLikedProvider.refresh();
			nodeRepoProvider.refresh();
			nodeUserProvider.refresh();
		}),
	);
}

export function deactivate() {}
