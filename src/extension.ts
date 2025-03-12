import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | null = null;

export function activate(context: vscode.ExtensionContext) {
  // Get the configuration
  const config = vscode.workspace.getConfiguration('mpls');
  const executablePath = config.get<string>('executablePath') || 'mpls';
  const optionalArguments = config.get<string[]>('optionalArguments') || ['--no-auto', '--enable-emoji', '--enable-footnotes'];
  const shutdownWhenAllClosed = config.get<boolean>('shutdownWhenAllClosed') !== false; // Default to true

  // Define server options
  const serverOptions: ServerOptions = {
    command: executablePath,
    args: optionalArguments,
    options: {
      shell: true
    }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for markdown documents
    documentSelector: [{ scheme: 'file', language: 'markdown' }],
    // Add middleware to track active markdown documents
    middleware: {
      didOpen: (document, next) => {
        next(document);
      },
      didClose: (document, next) => {
        next(document);

        // Check if there are any open markdown documents left
        const openMarkdownDocs = vscode.workspace.textDocuments.filter(
          doc => doc.languageId === 'markdown'
        );

        if (openMarkdownDocs.length === 0 && client && shutdownWhenAllClosed) {
          // No markdown documents are open, shut down the server if the option is enabled
          console.log('No markdown documents open, shutting down MPLS server');
          const c = client;
          client = null; // Set to null so it can be restarted later
          c.stop().then(() => {
            console.log('MPLS server stopped');
          });
        }
      }
    }
  };

  // Function to start the client if not already running
  function startClient() {
    if (client) {
      return; // Client already running
    }

    // Create a new client instance if needed
    client = new LanguageClient(
      'mpls',
      'MPLS - Markdown Preview Language Server',
      serverOptions,
      clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
    console.log('MPLS client started');
  }

  // Start the client when a markdown document is opened
  if (vscode.workspace.textDocuments.some(doc => doc.languageId === 'markdown')) {
    startClient();

    // If there's already a markdown file open in the editor, send initial focus notification
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'markdown' && client) {
      // Small delay to ensure client is fully initialized
      setTimeout(() => {
        client?.sendNotification('mpls/editorDidChangeFocus', {
          uri: activeEditor.document.uri.toString(),
          fileName: activeEditor.document.fileName
        });
        console.log('Sent initial focus notification for', activeEditor.document.fileName);
      }, 1000);
    }
  }

  // Set up a listener to start the client when a markdown document is opened
  const docOpenListener = vscode.workspace.onDidOpenTextDocument(document => {
    if (document.languageId === 'markdown') {
      startClient();
    }
  });
  context.subscriptions.push(docOpenListener);

  // Track editor focus changes to notify the language server
  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && editor.document.languageId === 'markdown' && client) {
      // Send a custom notification to the language server with the current document URI
      client.sendNotification('mpls/editorDidChangeFocus', {
        uri: editor.document.uri.toString(),
        fileName: editor.document.fileName
      });
      console.log('Sent focus change notification for', editor.document.fileName);
    }
  });
  context.subscriptions.push(editorChangeListener);

  // Register the "Open Preview" command
  const openPreviewCommand = vscode.commands.registerCommand('mpls.openPreview', async () => {
    // Make sure the client is running
    startClient();

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
      vscode.window.showWarningMessage('Open a Markdown file first to preview');
      return;
    }

    // Wait for client to be ready
    await client?.onReady();

    // Send the command to the language server
    client?.sendRequest('workspace/executeCommand', {
      command: 'open-preview',
      arguments: [editor.document.uri.toString()]
    }).then(
      () => console.log('Preview command sent successfully'),
      (error) => console.error('Failed to send preview command:', error)
    );
  });

  context.subscriptions.push(openPreviewCommand);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
