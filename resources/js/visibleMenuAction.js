/**
 * Decide whether a Nova action stays inside the "..." menu.
 * Icon actions are removed by the caller; this only applies the menu rules
 * that must not follow an action out to the toolbar.
 */
export function isVisibleMenuAction (action, { parentFile, hasResource }) {
  if (! action) {
    return false
  }

  const indexRow = typeof parentFile === 'string' && parentFile.includes('InlineActionDropdown')
  const indexStandalone = ! hasResource

  // The index row only lists inline actions. Standalone actions such as a
  // mass import stay on the index heading, where this dropdown has no resource.
  if (indexRow && (action.showOnTableRow === false || action.standalone === true)) {
    return false
  }

  // An unauthorized or nameless entry must not keep an empty "..." on the
  // index. The detail menu keeps the list Nova already sent.
  if ((indexRow || indexStandalone) && (action.authorizedToRun === false || action.authorizedToSee === false)) {
    return false
  }

  if ((indexRow || indexStandalone) && (typeof action.name !== 'string' || action.name.trim().length === 0)) {
    return false
  }

  return true
}
