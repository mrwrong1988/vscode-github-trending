import * as vscode from 'vscode';
import {StroageKey} from './storage';

export interface LikeDetail {
	name: string;
	url: string;
	avatar: string;
}

export class LikedNodeProvider implements vscode.TreeDataProvider<Liked> {

  private _onDidChangeTreeData: vscode.EventEmitter<Liked | null | undefined | void> = new vscode.EventEmitter<Liked | null | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<void | Liked | null | undefined> | undefined = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Liked): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Liked | undefined): vscode.ProviderResult<Liked[]> {
    const likeList = this.context.globalState.get<LikeDetail[]>(StroageKey.LIKE) || ([] as LikeDetail[]);
    return likeList.map(item => new Liked(item, vscode.TreeItemCollapsibleState.None));
  }
}

export class Liked extends vscode.TreeItem {
  constructor(
    public readonly detail: LikeDetail,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(detail.name, collapsibleState);
  }

  get tooltip(): string {
    return this.detail.name;
  }

  iconPath = vscode.Uri.parse(this.detail.avatar);

  command = {command: 'githubTrending.open', title: 'Open', arguments: [this.detail.url, this.detail.name]};

  contextValue = 'liked';
}
