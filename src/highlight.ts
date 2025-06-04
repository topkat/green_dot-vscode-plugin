/* eslint-disable no-cond-assign */

import vscode from 'vscode'
const window = vscode.window
const workspace = vscode.workspace

import { isset } from "../utils"

//----------------------------------------
// CONFIG
//----------------------------------------

const styles = {
    // GLOBAL
    dim: { opacity: '0.6' },
    delete: {
        fontWeight: 'bold',
        backgroundColor: '#953627',
        color: '#000',
    },
    apiErrorCode: {
        fontWeight: 'bold',
        borderRadius: '3px',
        backgroundColor: '#953627',
        color: '#FFF',
    },
    apiSuccessCode: {
        fontWeight: 'bold',
        borderRadius: '3px',
        backgroundColor: '#0E6C3C',
        color: '#FFF',
    },
    warningSign: {
        fontWeight: 'bold',
        backgroundColor: '#A17D2B',
        color: '#000',
    },
    todo: {
        fontWeight: 'bold',
        backgroundColor: '#A17D2B',
        color: '#000',
    },
    error: {
        color: '#c55e5e',
    },
    comment: {
        color: '#777',
    },
    godMode: {
        fontWeight: 'bold',
        color: '#3fa787',
        backgroundColor: '#316353',
    },
    systemLight: {
        fontWeight: 'bold',
        backgroundColor: '#264d40',
    },
    packageJsonH1: {
        fontWeight: 'bold',
        color: '#80B6F8',
        backgroundColor: '#18212C',
    },
    leroy: {
        color: '#FFFFFF',
        backgroundColor: '#78BE20',
        fontWeight: 'bold',
    },
    bricoDepot1: {
        color: '#FFFFFF',
        backgroundColor: '#a90c15',
        fontWeight: 'bold',
    },
    bricoDepot2: {
        color: '#FFFFFF',
        backgroundColor: '#000000',
        fontWeight: 'bold',
    },
    inputStyle: {
        // fontWeight: 'bold',
        opacity: '0.8',
        // color: '#777',
    }
} as const satisfies Record<string, Parameters<typeof window.createTextEditorDecorationType>[0]>

let cacheCall = 0
let cache = [] as any[]
const style = (style: keyof typeof styles, aditional: Parameters<typeof window.createTextEditorDecorationType>[0] = {}) => {
    // allow to delete previous styles when highlighting
    cache[cacheCall] ??= window.createTextEditorDecorationType({ ...styles[style], ...aditional })
    return cache[cacheCall++]
}

const init = (fileName: string) => {
    regexpHighlight(/\/!\\/g, style('warningSign'))
    regexpHighlightFirstCapturingGroup(/(TODO|HACK)/g, style('todo'))
    regexpHighlightFirstCapturingGroup(/(DELETEME|TODELETE|FIXME)/g, style('delete'))
    regexpHighlight(/(?:ctx\.)?(?:error)(?:\.|\[)[[\]A-Za-z0-9_]+/g, style('error'))
    regexpHighlightFirstCapturingGroup(/(ctx.GM|ctx.system\(\))/g, style('godMode'))

    regexpHighlightFirstCapturingGroup(/Brico(Depot®)/ig, style('bricoDepot2'), style('bricoDepot1'))

    //----------------------------------------
    // PACKAGE.JSON
    //----------------------------------------
    if (/package.json/.test(fileName)) {
        regexpHighlight(/"\/\/.+/g, style('comment'))
        regexpHighlight(/"==.+/g, style('packageJsonH1'))
    }
    //----------------------------------------
    // TEST FILES
    //----------------------------------------
    if (/\.test/.test(fileName)) {
        regexpHighlight(/doc: `[^`]+`/g, style('comment'))
        // Highligh d: and error message
        regexpHighlightFirstCapturingGroup(/d: \[ ?([45]\d+),?.*?\],?/g,
            style('apiErrorCode'),
            style('comment'),
            style('comment')
        )
        regexpHighlightFirstCapturingGroup(/d: \[ ?(2\d+),?.*?\],?/g,
            style('apiSuccessCode'),
            style('comment'),
            style('comment')
        )
        // put the as in "...409, as 'system'..."
        regexpHighlightFirstCapturingGroup(/ +d: \[ ?\d+[^,]*,([^,])/g, style('dim', { before: { contentText: ' as ', color: 'rgba(100,100,100,.5)' } }))
        // highlight when there is no error code and add the "as"
        regexpHighlightFirstCapturingGroup(/d: \[ ?([^\d][^,]+),.*?\],?/g,
            style('comment', { before: { contentText: ' as ', color: 'rgba(100,100,100,.5)' } }),
            style('comment'),
            style('comment')
        )
        // higlight the system keyword
        regexpHighlightFirstCapturingGroup(/d: .*?['`](system)['`]/g,
            style('godMode')
        )
    }

    //----------------------------------------
    // SERVICES
    //----------------------------------------
    if (/\.svc/.test(fileName)) {
        regexpHighlight(/ {2,4}doc: `[^`]+`/g, style('comment'))
        regexpHighlight(/ {2,4}doc: {[^}]+}/gm, style('comment'))

        regexpHighlightFirstCapturingGroup(/ {2,4}(input(?:: |,))/g, style('inputStyle', {
            before: { contentText: '⬇ ', color: '#CE9178' },
            color: '#CE9178'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(output(?:: |,))/g, style('inputStyle', {
            before: { contentText: '⬆ ', color: '#326353' },
            color: '#326353'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(rateLimiter(?:: |,))/g, style('inputStyle', {
            before: { contentText: '⏱️ ' },
            color: '#CCCCCC'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(invalidateCacheFor(?:: |,).*)/g, style('inputStyle', {
            before: { contentText: '📦 ' },
            color: '#997AB3'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(for(?:: |,).*)/g, style('inputStyle', {
            before: { contentText: '👮 ' },
            color: '#4673B6'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(needsFingerprintOrPincode.*)/g, style('inputStyle', {
            before: { contentText: '🔒 ' },
            color: '#4673B6'
        }))
        regexpHighlightFirstCapturingGroup(/ {2,4}(async main)/g, style('inputStyle', { color: '#777' }))


    }



    cacheCall = 0
}

//----------------------------------------
// INIT
//----------------------------------------
export default (ctx = {} as any) => {
    highlight()
    window.onDidChangeActiveTextEditor(() => {
        console.log(`CHANGETEXTEDTOR`);
        cache = []
        highlight()
    }, null, ctx.subscriptions)
    workspace.onDidChangeTextDocument(highlight, null, ctx.subscriptions)
    workspace.onDidSaveTextDocument(highlight, null, ctx.subscriptions)
}


//----------------------------------------
// HELPERS
//----------------------------------------
function highlight() {
    try {
        const editor = window.activeTextEditor
        if (!editor || !editor.document) return

        const { fileName } = editor.document

        init(fileName)

    } catch (err) { console.error(err) }
}

/** Highlight whole match of the regexp */
function regexpHighlight(regexp, style) {
    const editor = window.activeTextEditor
    if (!editor) throw 'NO EDITOR ACTIVE'
    if (!isset(style)) throw new Error('style is not defined for regexpHighlight')
    const text = editor.document.getText()
    let match
    const ranges = [] as vscode.Range[]
    while ((match = regexp.exec(text))) {
        const start = editor.document.positionAt(match.index)
        const end = editor.document.positionAt(match.index + match[0].length)

        const range = new vscode.Range(start, end)

        ranges.push(range)
    }

    if (ranges.length) setTimeout(() => editor.setDecorations(style, ranges), 0) // FIX I duno problem
}

/**
 * @param {Array} styleForCapturingGroups [styleForWholeMatch, styleFor1styCapturing]
 * @param {*} hoverMessage
 */
function regexpHighlightFirstCapturingGroup(
    regexp: RegExp,
    styleForCapturingGroup,
    styleForTheRest?,
    styleForSecondBit?
) {
    const editor = window.activeTextEditor
    if (!editor) throw 'NO EDITOR ACTIVE'
    const { document } = editor

    const text = document.getText()
    let match: RegExpExecArray | null

    const rangesFor1stBit = [] as vscode.Range[]
    const rangesFor2ndBit = [] as vscode.Range[]
    const rangesForCapuring = [] as vscode.Range[]

    while (match = regexp.exec(text)) {
        if (!isset(match[1])) {
            rangesFor1stBit.push(new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + match[0].length)
            ))
        } else {
            const {
                index // index of the match in string
            } = match
            const [allString, firstCapturingGroup] = match

            const indexOfFirstCapuringGroup = allString.lastIndexOf(firstCapturingGroup)
            rangesFor1stBit.push(new vscode.Range(
                document.positionAt(index),
                document.positionAt(index + indexOfFirstCapuringGroup)
            ))
            rangesFor2ndBit.push(new vscode.Range(
                document.positionAt(index + indexOfFirstCapuringGroup + firstCapturingGroup.length),
                document.positionAt(index + allString.length)
            ))
            rangesForCapuring.push(new vscode.Range(
                document.positionAt(index + indexOfFirstCapuringGroup),
                document.positionAt(index + indexOfFirstCapuringGroup + firstCapturingGroup.length)
            ))
        }
    }

    if (styleForTheRest) editor.setDecorations(styleForTheRest, rangesFor1stBit)
    if (styleForSecondBit) editor.setDecorations(styleForSecondBit, rangesFor2ndBit)
    if (styleForCapturingGroup) editor.setDecorations(styleForCapturingGroup, rangesForCapuring)

}
