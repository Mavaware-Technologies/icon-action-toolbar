<template>

    <div :class="{ 'icon-action-toolbar-wrapper': standalone && isDetailView }">

        <div v-if="actions.length > 0"
             :class="{ 'rounded': standalone, 'rounded bg-gray-700/5 dark:bg-gray-950': !standalone }"
             class="flex dark:focus:ring-gray-600 justify-evenly">

            <div v-for="{ iconActionToolbar, destructive, uriKey, name, authorizedToRun } of actions" :key="uriKey">

                <button
                    v-tooltip="name"
                    v-if="iconActionToolbar"
                    type="button"
                    @click.stop.prevent="authorizedToRun !== false && $emit('click', uriKey)"
                    :class="{
                        'dark:hover:[&:not(:disabled)]:text-primary-500 px-2': parentType === 'ActionSelector',
                        'w-auto': !isDetailView && !standalone,
                        'px-3 w-auto': !isDetailView && parentType === 'LoadingView.vue',
                        'hover:[&:not(:disabled)]:text-red-400 dark:hover:[&:not(:disabled)]:text-red-400 min-w-9': destructive && !isDetailView,
                        'hover:[&:not(:disabled)]:text-primary-500 dark:hover:[&:not(:disabled)]:text-primary-500 min-w-9': !destructive && !isDetailView,
                        'rounded hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring px-3 hover:text-gray-500': standalone && isDetailView,
                        'opacity-50 cursor-not-allowed': authorizedToRun === false,
                    }"
                    class="inline-flex items-center justify-center toolbar-button h-9 dark:text-gray-400 text-gray-500 disabled:opacity-50 disabled:pointer-events-none">

                    <Icon v-if="typeof iconActionToolbar.icon !== 'string'" name="cube-transparent"/>

                    <template v-else-if="iconActionToolbar.icon?.trim()?.startsWith('<svg')">
                        <div v-html="iconActionToolbar.icon"/>
                    </template>

                    <font-awesome-icon
                        v-else-if="isFontAwesomeIcon(iconActionToolbar.icon)"
                        :icon="resolveFontAwesomeIcon(iconActionToolbar.icon)"
                        class="w-5 h-5"
                    />

                    <Icon v-else-if="iconActionToolbar.icon" :name="iconActionToolbar.icon"/>

                    <div class="ml-1 mr-1 whitespace-nowrap" v-if="iconActionToolbar.label">
                        {{ iconActionToolbar.label }}
                    </div>

                </button>

            </div>

        </div>

    </div>

</template>

<script>

    import { Icon, Button } from 'laravel-nova-ui'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { findIconDefinition, library } from '@fortawesome/fontawesome-svg-core'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { far } from '@fortawesome/free-regular-svg-icons'
    import {computed} from "vue";

    library.add(fas, far)

    export default {
        components: { Icon, Button, FontAwesomeIcon },
        emits: [ 'click' ],
        props: [ 'actions', 'standalone', 'parentType' ],
        methods: {
            isFontAwesomeIcon(icon) {
                return typeof icon === 'string' && /^(fa|fas|far):/.test(icon.trim())
            },
            fontAwesomeStyle(icon) {
                const normalized = icon.trim().toLowerCase()

                if (normalized.startsWith('far:')) {
                    return 'far'
                }

                // "fa:" remains backward-compatible and maps to solid.
                return 'fas'
            },
            normalizeFontAwesomeIcon(icon) {
                return icon.replace(/^(fa|fas|far):/i, '').trim()
            },
            resolveFontAwesomeIcon(icon) {
                const style = this.fontAwesomeStyle(icon)
                const name = this.normalizeFontAwesomeIcon(icon)

                if (this.fontAwesomeIconExists(style, name)) {
                    return [style, name]
                }

                if (style !== 'fas' && this.fontAwesomeIconExists('fas', name)) {
                    return ['fas', name]
                }

                return [style, name]
            },
            fontAwesomeIconExists(style, name) {
                try {
                    return Boolean(findIconDefinition({ prefix: style, iconName: name }))
                } catch (error) {
                    return false
                }
            },
        },
        computed: {
            isDetailView() {
                const isDetailPage = computed(() => {
                    const url = window.location.pathname
                    // Match both numeric IDs and UUID patterns at the end of the URL
                    // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (where x is hex)
                    return /\/resources\/[\w\-]+\/(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(url)
                })

                return isDetailPage.value && this.parentType === 'DetailActionDropdown.vue'
            },
        },
    }

</script>

<style lang="scss">

    .icon-action-toolbar-wrapper {
        width: calc(100% - 48px);
        overflow-x: auto;
    }

    div[dusk$="detail-component"] div.icon-action-toolbar {
        @apply mx-0;
    }

    table div.icon-action-toolbar .hover-element {

        &:hover {
            @apply bg-transparent #{!important};
        }

        button > div {
            @apply px-3;
        }

    }

</style>
