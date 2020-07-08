import * as vscode from 'vscode';
import { REPO_SINCE, REPO_LANGUAGE, REPO_SPOKEN_LANGUAGE, sinces, sincesMap, languages, languagesMap, spokenLanguages, spokenLanguagesMap } from './conditions';
import fetch from 'node-fetch';

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
    console.log('RepoNodeProvider constructor');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Repo): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Repo | undefined): vscode.ProviderResult<Repo[]> {
    const sinceTitle = this.context.globalState.get<string>(REPO_SINCE) || sinces[0];
    const since = sincesMap[sinceTitle];

    const languageTitle = this.context.globalState.get<string>(REPO_LANGUAGE) || languages[0];
    const language = languagesMap[languageTitle];

    const spokenLanguageTitle = this.context.globalState.get<string>(REPO_SPOKEN_LANGUAGE) || spokenLanguages[0];
    const spokenLanguage = spokenLanguagesMap[spokenLanguageTitle];

    return this._fetchRepo(since, language, spokenLanguage);
  }

  async _fetchRepo(since: string, language: string, spokenLanguage: string) {
    const res = await fetch(`https://ghapi.huchen.dev/repositories?since=${since}&language=${language}&spoken_language_code=${spokenLanguage}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const list: [RepoDetail] = await res.json();
    return list.map(repo => new Repo(repo, vscode.TreeItemCollapsibleState.None));
  }
}

export class Repo extends vscode.TreeItem {
  constructor(
    public readonly detail: RepoDetail,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(detail.name, collapsibleState);
  }

  get tooltip(): string {
    return this.detail.description;
  }

  iconPath = vscode.Uri.parse(this.detail.avatar);

  command = {command: 'nodeRepos.view', title: 'View Repo', arguments: [this.detail.name, this.detail.url]};

  contextValue = 'repo';
}
