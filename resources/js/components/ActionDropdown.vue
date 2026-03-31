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
        v-if="originalActionDropdown && menuActions.length > 0"
        :is="originalActionDropdown"
        v-bind="props"
        :actions="menuActions"
        @actionExecuted="event => emitter('actionExecuted', event)"
        @show-preview="event => emitter('show-preview', event)"
    />
  </div>

</template>

<script setup>

import {useActions} from '@/composables/useActions'
import {useLocalization} from '@/composables/useLocalization'
import IconActionToolbar from './IconActionToolbar.vue'
import {computed, getCurrentInstance} from 'vue'
import NovaActionDropdown from '@/components/Dropdowns/ActionDropdown.vue'

const emitter = defineEmits(['actionExecuted', 'show-preview'])

const props = defineProps({
  resourceName: {},
  viaResource: {},
  viaResourceId: {},
  viaRelationship: {},
  relationshipType: {},
  actions: {type: Array, default: []},
  selectedResources: {type: [Array, String], default: () => []},
  endpoint: {type: String, default: null},
  triggerDuskAttribute: {type: String, default: null},
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

const {__} = useLocalization()
const instance = getCurrentInstance()

const runAction = () => executeAction(() => emitter('actionExecuted'))
const parentType = instance.parent.vnode.type.__file
const originalActionDropdown = computed(() => NovaActionDropdown ?? null)
const hasToolbarIcon = action => Boolean(action?.iconActionToolbar?.icon)

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

const extraIconActions = computed(() => {
  const actions = []
  const resource = instance.parent?.props?.resource
  const currentUser = Nova.store.getters['currentUser']
  const config = Nova.config('icon_action_toolbar')
  const isViaManyToMany = instance.parent?.props?.viaManyToMany === true

  if (resource && isViaManyToMany === false) {

    if (resource.authorizedToReplicate) {

      actions.push({
        name: __('Replicate'),
        uriKey: '__replicate-action__',
        iconActionToolbar: {icon: config.icons.replicate},
        onClick: () => {

          const url = instance.ctx.$url(`/resources/${props.resourceName}/${resource.id.value}/replicate`, {
            viaResource: props.viaResource,
            viaResourceId: props.viaResourceId,
            viaRelationship: props.viaRelationship,
          }).replace(Nova.config('base'), '')

          Nova.visit(url)
        },
      })
    }

    if (resource.authorizedToView && resource.previewHasFields) {

      actions.push({
        name: __('Preview'),
        uriKey: '__preview-action__',
        iconActionToolbar: {icon: config.icons.preview},
        onClick: () => instance.parent.emit('show-preview'),
      })
    }

    if (currentUser.canImpersonate && resource.authorizedToImpersonate) {

      actions.push({
        name: __('Impersonate'),
        uriKey: '__impersonate-action__',
        iconActionToolbar: {icon: config.icons.impersonate},
        onClick: () => instance.parent.ctx.startImpersonating({
          resource: props.resourceName,
          resourceId: resource.id.value,
        }),
      })
    }

    const isIndexPage = computed(() => {
      const url = window.location.pathname
      // Index pages typically end with the resource name
      return /\/resources\/[\w\-]+$/.test(url)
    })

    const isDetailPage = computed(() => {
      const url = window.location.pathname
      // Match both numeric IDs and UUID patterns at the end of the URL
      // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (where x is hex)
      return /\/resources\/[\w\-]+\/(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(url)
    })

    if (resource.authorizedToDelete
        && !resource.softDeleted
        && isDetailPage.value
        && props.selectedResources.length === 1
        && (props.selectedResources[0] === props.viaResourceId || props.viaResourceId === undefined)) {
      actions.push({
        name: __('Delete Resource'),
        uriKey: '__delete-resource-action__',
        iconActionToolbar: {icon: config.icons.delete_resource},
        onClick: () => instance.parent.ctx.openDeleteModal(),
      })
    }
  }

  return actions
})

const sourceActions = computed(() => {
  const hasResourceContext = Boolean(instance.parent?.props?.resource || props.resource)

  return (props.actions || []).filter(action => {
    // Row/detail dropdowns should never show standalone actions.
    if (hasResourceContext) {
      return !action.standalone
    }

    // Index standalone area always shows standalone actions.
    return action.standalone === true
  })
})

const allActionsForClick = computed(() => {
  return [...sourceActions.value, ...extraIconActions.value]
})

const iconActions = computed(() => {
  return [
    ...sourceActions.value.filter(action => hasToolbarIcon(action)),
    ...extraIconActions.value.filter(action => hasToolbarIcon(action)),
  ]
})

const menuActions = computed(() => {
  return sourceActions.value.filter(action => !hasToolbarIcon(action))
})

</script>
