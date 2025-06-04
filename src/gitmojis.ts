import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';



const gitmoji: Array<[emoji: string, description: string]> = [
  // META COMMANDS
  // this command allow to show 2 quickPicks so we can select a combination of two icons
  ['🤼', '==> COMBO <=='], // 🥂👯👩‍❤️‍👩 /!\ DO NOT CHANGE NAME, check below

  // GLOBAL
  ['🎨', 'Improve structure/format of the code / minor change'],
  ['🧹', 'Clean / refactor code'],
  ['✨', 'New functional feature (will be displayed in the changelog for the n👀bs)'],
  ['🥷', 'New dev feature (will be displayed in the changelog for the devs)'],

  ['🐞', 'Bug fix'],
  ['📚', 'Documentation creation / updates'], // 📖
  ['📁', 'rename file or folder'],
  ['🏗️', 'Move files / folder'],
  ['🧟‍♀️', 'Mark file as outdated / deprecated'],
  ['🗑️', 'remove / delete file'],
  ['🧰', 'Add helper / util function'],
  ['🗄️', 'Declare app constant'],
  ['🌏', 'Localization / translation changes / generate translations'],
  ['🧭', 'Type improvements / fixes #typescript #typings'], // 🤖🏫
  ['💬', 'Change / update import pathname'],
  ['🕵️', 'Tracking / statistics / analytics / data gathering'],
  ['🤡', 'Mock / test things'],
  ['🚧', 'Work in progress'],
  ['⚰️', 'Remove dead code / kill / delete'],
  ['💶', 'Payment / transactions / currency'],
  ['⏱️', 'Scheduled task / cronjob'],
  ['🚚', 'service improvements'],
  ['😀', 'user / permissions / connexion related changes'],
  ['🛠️', 'build script'],
  ['🛣️', 'new api / route / service'],


  // FRONT
  ['📱', 'develop new screen'],
  ['⚛️', 'Adding a new component'],
  ['🛠️', 'Modified components'],
  ['🛵', 'Navigation related changes'],
  ['📐', 'Layout style fix'],
  ['💄', 'style / css update'],
  ['💅', 'style / css update'],
  ['👩‍🎨', 'Design update'],
  ['🪝', 'Create hook'],
  ['📏', 'add a frontend token'],
  ['🎬', 'Adding a showcase / demo component'],
  ['💫', 'New animation'],
  ['🛒', 'Generate script assets auto'],
  ['🤖', 'Generate script assets auto'],
  ['🧱', 'Changes in assets'], // 🎞️
  ['🔄', 'Replace Components'],
  ['🔍', 'Improve SEO'],
  ['🎛️', 'Store / state / Provider / settings / config modifications updates new'],
  ['🎚️', 'Store / state / Provider / settings / config modifications updates new'],

  // BACK
  ['🏰', 'New backend service'],
  ['🧪', 'Créer modifier des tests (actuel emoji/phrase pas pertinente)'],
  ['🔑', 'key / env variable modification'],
  ['⛓️', 'Blockchain related changes'],
  ['👮‍♀️', 'Security / permission / roles / mask dao Feature'],
  ['🛂', 'Dao, authorization, roles, mask or permissions related changes'],
  ['🗄️', 'Dao, database, model related changes'], // 🗂️💾
  ['🌱', 'Add or update seed files'],
  ['📢', 'Add or update deployment script'],

  // Monorepo / structure
  ['📦', 'package.json related changes'],
  ['🙈', 'Add or update a .gitignore file'],
  ['🔖', 'Release / Version tags'],

  // WTF
  ['🍌', 'When you are proud of your code and you want to do the helicockter #dick #sboub #bite'],
  ['💩', 'Write shit / bad code'],
  ['🧻', 'Modify update refactor shit / bad code'],
  ['🪓', 'Hardcore refactoring'],
  ['🥚', 'Add or update an easter egg'],
  ['🪓🏓', 'Collaboration axe ping pong'],

  // COMBO
  ['⬆️', 'Upgrade / update of service, component… (meant to be used in combination)'],

]



export function gitmojis(context: vscode.ExtensionContext) {

  const disposable = vscode.commands.registerCommand('coreVscodeModule.showGitmoji', async (uri?) => {

    const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
    const gitExtension = vscodeGit && vscodeGit.exports
    const git = gitExtension && gitExtension.getAPI(1)

    const selected = await showQuickPick()

    if (selected && git) {
      let valueToAdd: string
      if (selected.label.includes('COMBO')) {
        const selected1 = await showQuickPick(true)
        const selected2 = await showQuickPick(true)
        valueToAdd = (selected1?.emoji || '') + (selected2?.emoji || '')
      } else valueToAdd = selected.emoji

      vscode.commands.executeCommand("workbench.view.scm")

      if (uri) {
        const uriPath = uri._rootUri?.path || uri.rootUri.path;
        let selectedRepository = git.repositories.find(repository => repository.rootUri.path === uriPath)
        if (selectedRepository) {
          updateCommit(selectedRepository, valueToAdd)
        }
      } else {
        for (let repo of git.repositories) {
          updateCommit(repo, valueToAdd)
        }
      }
    }
  })

  context.subscriptions.push(disposable)
}

function updateCommit(repository: Repository, valueOfGitmoji: String) {
  repository.inputBox.value = `${valueOfGitmoji} ${repository.inputBox.value}`
}

async function showQuickPick(secondLevel = false) {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  const git = gitExtension && gitExtension.getAPI(1)

  if (!git) vscode.window.showErrorMessage('Unable to load Git Extension')
  else {

    const items = gitmoji
      .filter(([e, descr]) => secondLevel !== true || !descr.includes('COMBO'))
      .map(([emoji, description]) => (
        { label: `${emoji} ${description}`, emoji }
      ))

    return await vscode.window.showQuickPick(items)
  }
}