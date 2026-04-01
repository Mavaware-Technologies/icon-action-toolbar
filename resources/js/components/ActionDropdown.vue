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

const iconActions = computed(() => {
  return sourceActions.value.filter(action => hasToolbarIcon(action))
})

const menuActions = computed(() => {
  return sourceActions.value.filter(action => !hasToolbarIcon(action))
})

const showOriginalDropdown = computed(() => {
  return menuActions.value.length > 0 || Boolean(slots.menu || slots.trigger)
})

</script>
