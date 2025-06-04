'use strict'

import highlight from './highlight'
import genSynopsisForTestFlows from './generate-synopsis-header-for-test-flows'
import h1 from './asciiArtHeader'

export function activate(ctx) {
    console.log(`== INITIATED (v1.0.6) ==\n\n`) // if this is not triggered, please check that package.json activationEvents match the opened file
    highlight(ctx)
    genSynopsisForTestFlows(ctx)
    h1()
}
