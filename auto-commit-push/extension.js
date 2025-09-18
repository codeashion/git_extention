// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
// The 'exec' function from 'child_process' allows us to run shell commands
const { exec } = require('child_process');

/**
 * This method inpm cache clean --forces called when your extension is activated.
 * Your extension is activated the very first time the command is executed.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('auto-commit-push.run', function () {
		// Get the active workspace folder.
		const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : null;

		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder is open. Please open a project to use this extension.');
			return;
		}

		const cwd = workspaceFolder.uri.fsPath;

		// --- Helper function to run shell commands ---
		const runCommand = (command) => {
			return new Promise((resolve, reject) => {
				exec(command, { cwd }, (error, stdout, stderr) => {
					if (error) {
						console.error(`Error executing command: ${command}\n${stderr}`);
						return reject({ message: `Failed: ${command}`, stderr });
					}
					resolve(stdout);
				});
			});
		};

		// --- Main Logic ---
		async function commitAndPush() {
			try {
				vscode.window.showInformationMessage('Starting auto commit & push...');

				// 1. Stage all changes
				await runCommand('git add .');
				console.log('Staged all files.');

				// 2. Commit the changes
				const commitMessage = `Auto-commit: ${new Date().toLocaleString()}`;
				await runCommand(`git commit -m "${commitMessage}"`);
				console.log(`Committed with message: "${commitMessage}"`);

				// 3. Push to the remote repository
				await runCommand('git push');
				console.log('Pushed to remote.');

				vscode.window.showInformationMessage('Successfully committed and pushed all changes!');
			} catch (err) {
				// If there's nothing to commit, git commit returns an error.
				// We can check for that specific case.
				if (err.stderr && err.stderr.includes('nothing to commit')) {
					vscode.window.showInformationMessage('No changes to commit.');
				} else {
					vscode.window.showErrorMessage(`An error occurred: ${err.stderr || err.message}`);
				}
			}
		}

		commitAndPush();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
