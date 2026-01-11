import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Flow Editor is now active!');

    // Register our custom editor provider
    const provider = new CustomFlowEditorProvider(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            CustomFlowEditorProvider.viewType,
            provider
        )
    );

    // Keep the command for manual opening if desired, but custom editor is main
    let disposable = vscode.commands.registerCommand('flowEditor.open', () => {
        vscode.window.showInformationMessage('Use File > Open to open .flowchartprocess.json files.');
    });
    context.subscriptions.push(disposable);

    // Register Right-Click Context Menu Command
    let openWithContext = vscode.commands.registerCommand('flowEditor.openWithContext', (uri: vscode.Uri) => {
        if (uri && uri.scheme === 'file') {
            vscode.commands.executeCommand('vscode.openWith', uri, CustomFlowEditorProvider.viewType);
        }
    });
    context.subscriptions.push(openWithContext);
}

class CustomFlowEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'flowEditor.flowchart';

    constructor(private readonly context: vscode.ExtensionContext) { }

    // Flag to prevent infinite loop of updates
    private isUpdateFromWebview = false;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Receive message from the webview.
        // IMPORTANT: We must register this listener BEFORE setting the HTML to ensure we don't miss the "ready" message
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'change':
                    this.isUpdateFromWebview = true;
                    this.updateTextDocument(document, e.payload);
                    return;
                case 'ready':
                    console.log('Received ready from webview');
                    this.updateWebview(webviewPanel, document);
                    return;
                case 'openFile':
                    this.handleOpenFile(e.payload);
                    return;
            }
        });

        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'dist'))]
        };

        // Load HTML asynchronously
        webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

        // Send content to webview
        // this.updateWebview(webviewPanel, document);

        // Listen for document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                if (e.contentChanges.length === 0) return; // Ignore if no changes (e.g. save)

                // If this update was triggered by the webview, ignore it (don't send it back)
                if (this.isUpdateFromWebview) {
                    this.isUpdateFromWebview = false;
                    return;
                }

                this.updateWebview(webviewPanel, document);
            }
        });

        // Cleanup
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }



    private async handleOpenFile(payload: { type: 'java' | 'process', target: string }) {
        if (!payload || !payload.target) return;

        console.log(`Searching for file... Type: ${payload.type}, Target: ${payload.target}`);

        let searchTerm = '';
        if (payload.type === 'java') {
            // Assume target is fully qualified like com.example.MyAction
            // We search for the simple class name file
            const parts = payload.target.split('.');
            const simpleName = parts[parts.length - 1];
            searchTerm = `**/${simpleName}.java`;
        } else if (payload.type === 'process') {
            // Process target is usually the name/ID
            searchTerm = `**/${payload.target}.flowchartprocess.json`;
        }

        try {
            const files = await vscode.workspace.findFiles(searchTerm, '**/node_modules/**', 1);
            if (files && files.length > 0) {
                const doc = await vscode.workspace.openTextDocument(files[0]);
                await vscode.window.showTextDocument(doc);
            } else {
                vscode.window.showWarningMessage(`Could not find file for ${payload.type}: ${payload.target}`);
            }
        } catch (err) {
            console.error('Error opening file:', err);
            vscode.window.showErrorMessage(`Error opening file: ${err}`);
        }
    }

    private updateWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
        // Extract filename from the document URI
        const fsPath = document.uri.fsPath;
        const base = path.basename(fsPath);
        let fileName = base;

        // Handle specific double extension
        if (base.toLowerCase().endsWith('.flowchartprocess.json')) {
            fileName = base.substring(0, base.length - '.flowchartprocess.json'.length);
        } else {
            // Fallback to standard extension removal
            fileName = path.basename(fsPath, path.extname(fsPath));
        }

        const relativePath = vscode.workspace.asRelativePath(document.uri);

        webviewPanel.webview.postMessage({
            type: 'update',
            payload: document.getText(),
            fileName: fileName,
            fullFileName: base, // Keep for backward compatibility if needed, but we'll use relativePath
            relativePath: relativePath
        });
    }

    // Updates the text document with new content from the webview
    private updateTextDocument(document: vscode.TextDocument, jsonStr: string) {
        const edit = new vscode.WorkspaceEdit();

        // Just replace the entire content for simplicity
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            jsonStr
        );

        return vscode.workspace.applyEdit(edit);
    }

    private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'index.html'));
        const distPath = vscode.Uri.file(path.join(this.context.extensionPath, 'dist'));
        const distUri = webview.asWebviewUri(distPath);

        try {
            // Use VS Code API to read file (works in web and strict ESM)
            const htmlContentArray = await vscode.workspace.fs.readFile(onDiskPath);
            const decoder = new TextDecoder('utf-8');
            let htmlContent = decoder.decode(htmlContentArray);

            htmlContent = htmlContent.replace(
                /(href|src)="(\.\/)?assets\/([^"]*)"/g,
                (match: string, p1: string, p2: string, p3: string) => `${p1}="${distUri}/assets/${p3}"`
            );

            return htmlContent;
        } catch (err) {
            console.error(err);
            return `<h1>Error loading UI</h1><p>${err}</p>`;
        }
    }
}

export function deactivate() { }
