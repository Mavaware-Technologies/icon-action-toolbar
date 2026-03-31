<template>

    <div class="icon-action-toolbar w-full flex items-center gap-2">

        <IconActionToolbar
            v-if="iconActionsForToolbar.length > 0"
            :actions="iconActionsForToolbar"
            @click="handleSelectionChange"
            :standalone="false"
            parent-type="ActionSelector"/>

        <component
            v-if="originalActionSelector && (menuActions.length > 0 || menuPivotActions.length > 0)"
            :is="originalActionSelector"
            v-bind="props"
            :actions="menuActions"
            :pivot-actions="{ ...props.pivotActions, actions: menuPivotActions }"
            @actionExecuted="event => emitter('actionExecuted', event)"
        />

        <!-- Confirm Action Modal -->
        <component
            class="text-left"
            v-if="actionModalVisible"
            :show="actionModalVisible"
            :is="selectedAction?.component"
            :working="working"
            :selected-resources="selectedResources"
            :resource-name="resourceName"
            :action="selectedAction"
            :errors="errors"
            @confirm="executeAction"
            @close="closeConfirmationModal"
        />

        <component
            v-if="responseModalVisible"
            :show="responseModalVisible"
            :is="actionResponseData?.modal"
            @confirm="closeResponseModal"
            @close="closeResponseModal"
            :data="actionResponseData"
        />

    </div>

</template>

<script setup>

    import { useActions } from '@/composables/useActions'
    import { computed, ref } from 'vue'
    import IconActionToolbar from './IconActionToolbar.vue'
    import NovaActionSelector from '@/components/ActionSelector.vue'

    // Elements
    const actionSelectControl = ref(null)
    const emitter = defineEmits([ 'actionExecuted' ])

    const props = defineProps({
        width: { type: String, default: 'auto' },
        pivotName: { type: String, default: null },
        resourceName: {},
        viaResource: {},
        viaResourceId: {},
        viaRelationship: {},
        relationshipType: {},
        pivotActions: { type: Object, default: () => ({ name: 'Pivot', actions: [] }) },
        actions: { type: Array, default: [] },
        selectedResources: { type: [ Array, String ], default: () => [] },
        endpoint: { type: String, default: null },
        triggerDuskAttribute: { type: String, default: null },
    })

    const {
        errors,
        actionModalVisible,
        responseModalVisible,
        openConfirmationModal,
        closeConfirmationModal,
        closeResponseModal,
        handleActionClick,
        selectedAction,
        setSelectedActionKey,
        determineActionStrategy,
        working,
        executeAction,
        availableActions,
        availablePivotActions,
        actionResponseData,
    } = useActions(props, emitter, Nova.store)

    const handleSelectionChange = event => {
        setSelectedActionKey(event)
        determineActionStrategy()
    }

    const originalActionSelector = computed(() => NovaActionSelector ?? null)

    const hasToolbarIcon = action => Boolean(action?.iconActionToolbar?.icon)

    const sourceActions = computed(() => {
        return availableActions.value.filter(action => action.showOnTableRow === false)
    })

    const sourcePivotActions = computed(() => {
        return availablePivotActions.value.filter(action => action.showOnTableRow === false)
    })

    const iconActionsForToolbar = computed(() => {
        const actions = [
            ...sourceActions.value,
            ...sourcePivotActions.value.map(a => ({
                group: props.pivotName,
                uriKey: a.uriKey,
                name: a.name,
                iconActionToolbar: a.iconActionToolbar,
                authorizedToRun: a.authorizedToRun,
                component: a.component,
            })),
        ]

        return actions.filter(action => hasToolbarIcon(action))
    })

    const menuActions = computed(() => {
        return sourceActions.value.filter(action => !hasToolbarIcon(action))
    })

    const menuPivotActions = computed(() => {
        return sourcePivotActions.value.filter(action => !hasToolbarIcon(action))
    })

</script>
