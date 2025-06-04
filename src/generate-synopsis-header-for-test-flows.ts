
import vscode from 'vscode'
import { allMatches } from '../utils'

const workspace = vscode.workspace
const window = vscode.window

//----------------------------------------
// TEST FLOW AUTO SYNOPSIS
//----------------------------------------
export default (ctx = {} as any) => {
    workspace.onWillSaveTextDocument(async function (event) {
        try {
            const editor = window.activeTextEditor
            if (!editor) return
            if (event.document === editor.document && editor.document.fileName.endsWith('.test-flow.ts') || editor.document.fileName.endsWith('.test.ts')) {
                const text = editor.document.getText()
                if (text.includes('rest-test')) {
                    const match = /^\/\* SYNOPSIS[\s\S]*?\*\/\n?\n?/.exec(text)
                    const alreadyExistingSelection = match && match[0]
                    const matchIndex = match && match.index ? match.index : 0
                    const matchEnd = match?.[0]?.length || 0

                    const docLines = text
                        .split('\n')
                        .filter(line => /^ +(d: \[([^\]]+)\]|doc: `(.+?)`)/.test(line))
                        .map(line => / +d: /.test(line) ? line.replace(/ +d: \[([^\]]+)\].*/, '$1') : line.replace(/ +doc: `([^`]+).*/, '$1'))

                    const allDescriptionMatches = allMatches(text, /(?= d: \[([^\]]+)\]|doc: `(.+?)`,\s*\n)/g)
                    let synopsis = '/* SYNOPSIS\n\n'

                    let i = 0
                    for (const description of docLines) {
                        synopsis += `${++i}) ${description}\n`
                    }
                    synopsis += '*/\n\n'

                    await editor.edit(editBuilder => {
                        if (alreadyExistingSelection) {
                            const deleteStart = editor.document.positionAt(matchIndex)
                            const deleteEnd = editor.document.positionAt(matchIndex + matchEnd)
                            editBuilder.delete(new vscode.Range(deleteStart, deleteEnd))
                        }
                        editBuilder.insert(editor.document.positionAt(0), synopsis)
                    })
                }
            }
        } catch (err) { console.error(err) }
    }, null, ctx.subscriptions)
}