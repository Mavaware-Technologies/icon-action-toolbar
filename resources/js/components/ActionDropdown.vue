<template>

  <div class="icon-action-toolbar inline-flex items-center gap-2">

    <!-- Confirm Action Modal -->
    <component
        v-if="actionModalVisible"
        :show="actionModalVisible"
        class="text-left"
        :is="selectedAction?.component"
        :working="working"
        :selected-resources="selectedResources"
        :resource-name="resourceName"
        :action="selectedAction"
        :errors="errors"
        @confirm="runAction"
        @close="closeConfirmationModal"/>

    <component
        v-if="responseModalVisible"
        :show="responseModalVisible"
        :is="actionResponseData?.modal"
        @confirm="handleResponseModalConfirm"
        @close="handleResponseModalClose"
        :data="actionResponseData"/>

    <IconActionToolbar
        v-if="iconActions.length > 0"
        :parent-type="parentType"
        :actions="iconActions"
        @click="onClick"
        :standalone="true"/>

    <component
        v-if="originalActionDropdown && showOriginalDropdown"
        :is="originalActionDropdown"
        v-bind="dropdownProps"
        :actions="menuActions"
        @actionExecuted="event => emitter('actionExecuted', event)"
        @show-preview="event => emitter('show-preview', event)"
    >
      <template v-if="slots.trigger" #trigger>
        <slot name="trigger" />
      </template>
      <template v-if="slots.menu" #menu>
        <slot name="menu" />
      </template>
      <slot />
    </component>
  </div>

</template>

<script setup>

import {useActions} from '@/composables/useActions'
import IconActionToolbar from './IconActionToolbar.vue'
import {computed, getCurrentInstance, useAttrs, useSlots} from 'vue'
import NovaActionDropdown from '@/components/Dropdowns/ActionDropdown.vue'
defineOptions({inheritAttrs: false})

const emitter = defineEmits(['actionExecuted', 'show-preview'])

const props = defineProps({
  resource: {type: Object, default: null},
  resourceName: {},
  viaResource: {},
  viaResourceId: {},
  viaRelationship: {},
  relationshipType: {},
  actions: {type: Array, default: []},
  selectedResources: {type: [Array, String], default: () => []},
  endpoint: {type: String, default: null},
  triggerDuskAttribute: {type: String, default: null},
  showHeadings: {type: Boolean, default: false},
})

const {
  errors,
  actionModalVisible,
  responseModalVisible,
  closeConfirmationModal,
  closeResponseModal,
  handleActionClick,
  selectedAction,
  working,
  executeAction,
  actionResponseData,
} = useActions(props, emitter, Nova.store)

const instance = getCurrentInstance()
const attrs = useAttrs()
const slots = useSlots()

const runAction = () => executeAction(() => emitter('actionExecuted'))
const parentType = instance.parent.vnode.type.__file
const originalActionDropdown = computed(() => NovaActionDropdown ?? null)
const hasToolbarIcon = action => Boolean(action?.iconActionToolbar?.icon)
const dropdownProps = computed(() => ({...attrs, ...props}))

const onClick = event => {
  const action = allActionsForClick.value.find(element => element.uriKey === event)

  if (!action) {
    return
  }

  if (typeof action.onClick === 'function') {
    action.onClick()
  } else {
    handleActionClick(event)
  }
}

const handleResponseModalConfirm = () => {
  closeResponseModal()
  emitter('actionExecuted')
}

const handleResponseModalClose = () => {
  closeResponseModal()
  emitter('actionExecuted')
}

const sourceActions = computed(() => props.actions || [])

const allActionsForClick = computed(() => {
  return [...sourceActions.value]
})

const isVisibleMenuAction = action => {
  if (!action) {
    return false
  }

  // If Nova marks the action as unauthorized, do not count it for the row dropdown.
  if (action.authorizedToRun === false) {
    return false
  }

  // Require a usable label/name to avoid empty placeholder entries.
  return typeof action.name === 'string' && action.name.trim().length > 0
}

const iconActions = computed(() => {
  return sourceActions.value.filter(action => hasToolbarIcon(action))
})

const menuActions = computed(() => {
  return sourceActions.value.filter(action => !hasToolbarIcon(action) && isVisibleMenuAction(action))
})

const isResourceDetailPage = computed(() => {
  const path = window.location.pathname

  return /\/resources\/[\w\-]+\/(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(path)
})

const showOriginalDropdown = computed(() => {
  if (menuActions.value.length > 0) {
    return true
  }

  // Hide the "..." dropdown trigger on index pages when there are no
  // non-icon actions. Keep slot-based trigger support only on resource detail pages.
  if (!isResourceDetailPage.value) {
    return false
  }

  return Boolean(slots.menu || slots.trigger)
})

</script>
