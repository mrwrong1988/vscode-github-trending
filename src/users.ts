import * as vscode from 'vscode';
import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import { sinces, sincesMap, languages, languagesMap } from './conditions';
import {StroageKey} from './storage';
import { LikeDetail } from './liked';

interface UserDetail {
  username: string;
  name: string;
  avatar: string;
  url: string;
}

export class UserNodeProvider implements vscode.TreeDataProvider<User> {

  private _onDidChangeTreeData: vscode.EventEmitter<User | null | undefined | void> = new vscode.EventEmitter<User | null | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<void | User | null | undefined> | undefined = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: User): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: User | undefined): vscode.ProviderResult<User[]> {
    const sinceTitle = this.context.globalState.get<string>(StroageKey.USER_SINCE) || sinces[0];
    const since = sincesMap[sinceTitle];

    const languageTitle = this.context.globalState.get<string>(StroageKey.USER_LANGUAGE) || languages[0];
    const language = languagesMap[languageTitle];

    return this._fetchUsers(since, language);
  }

  async _fetchUsers(since: string, language: string) {
    const params = new URLSearchParams();
    since && params.append('since', since);
    language && params.append('language', language);
    const res = await fetch(`https://ghapi.huchen.dev/developers?${params.toString()}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const list: [UserDetail] = await res.json();
    const likeList = this.context.globalState.get<LikeDetail[]>(StroageKey.LIKE) || ([] as LikeDetail[]);
    return list.map(user => new User(user, vscode.TreeItemCollapsibleState.None, likeList.findIndex(item => item.url === user.url) > -1));
  }
}

export class User extends vscode.TreeItem {
  constructor(
    public readonly detail: UserDetail,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly liked: boolean,
  ) {
    super(detail.name, collapsibleState);
  }

  get tooltip(): string {
    return this.detail.name;
  }

  iconPath = vscode.Uri.parse(this.detail.avatar);

  command = {command: 'githubTrending.open', title: 'Open', arguments: [this.detail.url, this.detail.name]};

  contextValue = this.liked ? 'liked' : 'user';
}
