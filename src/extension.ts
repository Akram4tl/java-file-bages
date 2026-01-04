import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri>();
  const cache = new Map<string, vscode.FileDecoration | undefined>();

  const provider: vscode.FileDecorationProvider = {
    onDidChangeFileDecorations: onDidChangeFileDecorations.event,
    provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
      if (!uri.fsPath.endsWith(".java")) return;

      // Return cached result
      const cached = cache.get(uri.fsPath);
      if (cached !== undefined) return cached;

      let content: string;
      try {
        content = fs.readFileSync(uri.fsPath, "utf8");
      } catch {
        return;
      }

      // Strip comments and strings to prevent false matches
      const snippet = content
        .substring(0, 1000)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/"(?:[^"\\]|\\.)*"/g, "")
        .replace(/'(?:[^'\\]|\\.)*'/g, "");

      const config = vscode.workspace.getConfiguration("javaFileBadges");

      // Regex patterns for Java types
      const abstractClassRegex = /^\s*(?:(?:public|private|protected|static|final|strictfp|synchronized)\s+)*abstract\s+(?:(?:public|private|protected|static|final|strictfp|synchronized)\s+)*class\s+\w+/m;
      const classRegex = /^\s*(?:(?:public|private|protected|static|final|abstract|strictfp|synchronized)\s+)*@?\w*\s*class\s+\w+/m;
      const interfaceRegex = /^\s*(?:(?:public|private|protected|static|final|abstract|strictfp|synchronized)\s+)*@?\w*\s*interface\s+\w+/m;
      const enumRegex = /^\s*(?:(?:public|private|protected|static|final|abstract|strictfp|synchronized)\s+)*@?\w*\s*enum\s+\w+/m;
      const annotationRegex = /^\s*(?:(?:public|private|protected|static|final|abstract|strictfp|synchronized)\s+)*@?\w*\s*@interface\s+\w+/m;
      const recordRegex = /^\s*(?:(?:public|private|protected|static|final|abstract|strictfp|synchronized)\s+)*@?\w*\s*record\s+\w+/m;

      let result: vscode.FileDecoration | undefined;

      if (abstractClassRegex.test(snippet))
        result = { badge: config.get<string>("abstractBadge") };
      else if (classRegex.test(snippet))
        result = { badge: config.get<string>("classBadge") };
      else if (interfaceRegex.test(snippet))
        result = { badge: config.get<string>("interfaceBadge") };
      else if (enumRegex.test(snippet))
        result = { badge: config.get<string>("enumBadge") };
      else if (annotationRegex.test(snippet))
        result = { badge: config.get<string>("annotationBadge") };
      else if (recordRegex.test(snippet))
        result = { badge: config.get<string>("recordBadge") };

      cache.set(uri.fsPath, result);
      return result;
    },
  };

  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider)
  );

  // Trigger badges on all open editors at startup
  vscode.window.visibleTextEditors.forEach((editor) => {
    if (editor.document.languageId === "java") {
      onDidChangeFileDecorations.fire(editor.document.uri);
    }
  });

  // Watch for file system changes
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.java");
  context.subscriptions.push(
    watcher.onDidCreate((uri) => {
      cache.delete(uri.fsPath);
      onDidChangeFileDecorations.fire(uri);
    }),
    watcher.onDidChange((uri) => {
      cache.delete(uri.fsPath);
      onDidChangeFileDecorations.fire(uri);
    }),
    watcher.onDidDelete((uri) => {
      cache.delete(uri.fsPath);
      onDidChangeFileDecorations.fire(uri);
    }),
    watcher
  );

  // Update badges when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document.languageId === "java") {
        onDidChangeFileDecorations.fire(editor.document.uri);
      }
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration("javaFileBadges.classBadge") ||
        e.affectsConfiguration("javaFileBadges.interfaceBadge") ||
        e.affectsConfiguration("javaFileBadges.enumBadge") ||
        e.affectsConfiguration("javaFileBadges.abstractBadge") ||
        e.affectsConfiguration("javaFileBadges.recordBadge") ||
        e.affectsConfiguration("javaFileBadges.annotationBadge")
      ) {
        cache.clear(); // clear cache so new badges are applied
        vscode.window.visibleTextEditors.forEach((editor) => {
          if (editor.document.languageId === "java") {
            onDidChangeFileDecorations.fire(editor.document.uri);
          }
        });
      }
    })
  );
}

export function deactivate() {}
