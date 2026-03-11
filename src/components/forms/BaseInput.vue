<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative rounded-md shadow-sm">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border placeholder-gray-400 bg-white/50 backdrop-blur-sm transition-colors"
        :class="[
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300',
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        ]"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        v-bind="$attrs"
      />
      <!-- Optional Right Icon/Slot -->
      <div v-if="$slots.suffix || suffixIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
        <slot name="suffix">
           <span v-if="suffixIcon" v-html="suffixIcon" class="h-5 w-5 text-gray-400"></span>
        </slot>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600" :id="`${id}-error`">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500" :id="`${id}-hint`">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text' // text, password, email, number, etc.
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  suffixIcon: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>
