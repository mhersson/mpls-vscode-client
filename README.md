# MPLS VSCode Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A VSCode extension for the
[Markdown Preview Language Server (MPLS)](https://github.com/mhersson/mpls).

## Features

- Connects to the Markdown Preview Language Server (`mpls`)
- Enables emoji support (via `--enable-emoji` flag)
- Enables footnotes support (via `--enable-footnotes` flag)
- **Open Preview Command**: Adds a command to open the Markdown preview
- **Smart Server Management**: Automatically shuts down the server when no
  Markdown files are open, and restarts it when needed

## Prerequisites

- [MPLS (Markdown Preview Language Server)](https://github.com/mhersson/mpls)
  executable installed and available in your PATH

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/mhersson/mpls-vscode-client.git
   cd mpls-vscode-client
   ```

2. Install dependencies and build

   ```bash
   npm install
   npm run compile
   ```

3. Create and install the VSIX package

   ```bash
   npm install -g @vscode/vsce
   vsce package
   code --install-extension mpls-vscode-client-0.1.0.vsix
   ```

   or copy the directory to your VS Code extensions folder

   - Windows: `%USERPROFILE%\.vscode\extensions`
   - macOS/Linux: `~/.vscode/extensions`

4. Restart VS Code

## Usage

1. Open any Markdown file in VSCode
2. The MPLS server will start automatically
3. To open the preview, use one of these methods:
   - Right-click in the editor and select "MPLS: Open Preview"
   - Click the preview button in the editor title area
   - Open the command palette (Ctrl+Shift+P) and run "MPLS: Open Preview"

The server will automatically shut down when all Markdown files are closed and
restart when needed.

## Configuration

You can customize the extension behavior in VS Code settings:

```json
// Path to the MPLS executable (if not in PATH)
"mpls.executablePath": "/path/to/your/mpls",

// Command arguments passed to mpls at startup
"mpls.optionalArguments": ["--no-auto", "--enable-emoji", "--enable-footnotes"]

// Whether to shut down the server when all Markdown files are closed
"mpls.shutdownWhenAllClosed": true
```

## Troubleshooting

If you encounter issues:

1. Check the Output panel in VSCode (View > Output) and select "MPLS - Markdown
   Preview Language Server" from the dropdown
2. Verify that your `mpls` executable is in your PATH or correctly configured in
   settings

## Related Projects

- [MPLS - Markdown Preview Language Server](https://github.com/mhersson/mpls)
