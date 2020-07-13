import * as vscode from 'vscode';
import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import { sinces, sincesMap, languages, languagesMap, spokenLanguages, spokenLanguagesMap } from './conditions';
import {StroageKey} from './storage';
import { LikeDetail } from './liked';

interface RepoDetail {
  author: string;
  name: string;
  avatar: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;

}

export class RepoNodeProvider implements vscode.TreeDataProvider<Repo> {

  private _onDidChangeTreeData: vscode.EventEmitter<Repo | null | undefined | void> = new vscode.EventEmitter<Repo | null | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<void | Repo | null | undefined> | undefined = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Repo): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Repo | undefined): vscode.ProviderResult<Repo[]> {
    const sinceTitle = this.context.globalState.get<string>(StroageKey.REPO_SINCE) || sinces[0];
    const since = sincesMap[sinceTitle];

    const languageTitle = this.context.globalState.get<string>(StroageKey.REPO_LANGUAGE) || languages[0];
    const language = languagesMap[languageTitle];

    const spokenLanguageTitle = this.context.globalState.get<string>(StroageKey.REPO_SPOKEN_LANGUAGE) || spokenLanguages[0];
    const spokenLanguage = spokenLanguagesMap[spokenLanguageTitle];

    return this._fetchRepos(since, language, spokenLanguage);
  }

  async _fetchRepos(since: string, language: string, spokenLanguage: string) {
    const params = new URLSearchParams();
    since && params.append('since', since);
    language && params.append('language', language);
    spokenLanguage && params.append('spokenLanguage', spokenLanguage);
    const res = await fetch(`https://ghapi.huchen.dev/repositories?${params.toString()}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const list: [RepoDetail] = await res.json();
    const likeList = this.context.globalState.get<LikeDetail[]>(StroageKey.LIKE) || ([] as LikeDetail[]);
    return list.map(repo => new Repo(repo, vscode.TreeItemCollapsibleState.None, likeList.findIndex(item => item.url === repo.url) > -1));
  }
}

export class Repo extends vscode.TreeItem {
  constructor(
    public readonly detail: RepoDetail,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly liked: boolean,
  ) {
    super(detail.name, collapsibleState);
  }

  get tooltip(): string {
    return this.detail.description;
  }

  iconPath = vscode.Uri.parse(this.detail.avatar);

  command = {command: 'githubTrending.open', title: 'Open', arguments: [this.detail.url, this.detail.name]};

  contextValue = this.liked ? 'liked' : 'repo';
}
