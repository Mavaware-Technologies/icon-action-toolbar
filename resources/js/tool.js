import ActionSelector from './components/ActionSelector.vue'
import ActionDropdown from './components/ActionDropdown.vue'

Nova.booting(app => {
    const originalActionSelector = app._context.components.ActionSelector ?? null
    const originalActionDropdown = app._context.components.ActionDropdown ?? null

    app.provide('iconActionToolbarOriginalComponents', {
        ActionSelector: originalActionSelector,
        ActionDropdown: originalActionDropdown,
    })

    app.component('ActionSelector', ActionSelector)
    app.component('ActionDropdown', ActionDropdown)
})
