<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" title="Pindah Kelas" maxWidth="sm">
    <div class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
        <p class="font-semibold text-amber-800">
          <span class="text-amber-900">{{ studentCount }}</span> siswa dari kelas
          <span class="font-bold text-amber-900">{{ fromClass?.name }}</span>
          akan dipindahkan.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas Tujuan <span class="text-red-500">*</span></label>
        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <label v-for="cls in availableClasses" :key="cls.id"
            class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
            :class="selectedDestination === cls.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-100 hover:border-gray-300'">
            <input type="radio" :value="cls.id" v-model="selectedDestination" class="text-primary focus:ring-primary">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-800 text-sm">{{ cls.name }}</span>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="cls.occupancy_status === 'full' ? 'bg-red-100 text-red-700'
                    : cls.occupancy_status === 'warning' ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'">
                  {{ cls.occupied }}/{{ cls.capacity || '∞' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Tersisa {{ cls.remaining ?? '∞' }} kursi</p>
            </div>
          </label>
        </div>
        <p v-if="availableClasses.length === 0" class="text-sm text-gray-400 text-center py-4">Tidak ada kelas lain tersedia</p>
      </div>

      <div v-if="selectedDestClass?.occupancy_status === 'full'" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        ⚠️ Kelas ini sudah penuh. Pemindahan mungkin gagal.
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="$emit('update:modelValue', false)" class="mr-3">Batal</BaseButton>
      <BaseButton
        variant="warning"
        @click="confirm"
        :disabled="!selectedDestination"
        :loading="loading">
        Pindahkan Siswa
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: Boolean,
  classes: { type: Array, default: () => [] },
  fromClass: { type: Object, default: null },
  studentCount: { type: Number, default: 0 },
  loading: Boolean
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedDestination = ref(null)

const availableClasses = computed(() =>
  props.classes.filter(c => c.id !== props.fromClass?.id)
)

const selectedDestClass = computed(() =>
  availableClasses.value.find(c => c.id === selectedDestination.value) || null
)

watch(() => props.modelValue, (val) => {
  if (val) selectedDestination.value = null
})

const confirm = () => {
  if (!selectedDestination.value) return
  emit('confirm', selectedDestination.value)
}
</script>
