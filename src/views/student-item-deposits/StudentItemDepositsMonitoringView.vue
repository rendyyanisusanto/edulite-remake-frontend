<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Monitoring Penitipan Barang</h1>
      <BaseButton variant="outline" @click="load">Refresh</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="items.length" :currentPage="1" :perPage="50" :showActions="false" :showPagination="false">
      <template #cell-student_name="{ item }">{{ item.student?.full_name || '-' }}</template>
      <template #cell-class_name="{ item }">{{ item.deposit?.class?.name || '-' }}</template>
      <template #cell-item_name="{ item }">{{ item.deposit?.item_name || '-' }}</template>
      <template #cell-actions="{ item }">
        <BaseButton size="sm" @click="returnItem(item)">Kembalikan</BaseButton>
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import svc from '@/services/api/studentItemDeposit.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const loading = ref(false)
const items = ref([])
const columns = [
  { key: 'loan_date', label: 'Tanggal' },
  { key: 'student_name', label: 'Siswa' },
  { key: 'class_name', label: 'Kelas' },
  { key: 'item_name', label: 'Barang' },
  { key: 'borrowed_at', label: 'Jam Pinjam' },
  { key: 'actions', label: 'Aksi' }
]

const load = async () => {
  loading.value = true
  try {
    const res = await svc.getActiveLoans({ page: 1, limit: 200 })
    items.value = res?.data?.items || []
  } catch (e) { showError(e.message || 'Gagal memuat monitoring') }
  finally { loading.value = false }
}

const returnItem = async (row) => {
  await svc.returnDaily(row.deposit_id, { return_method: 'MANUAL' })
  success('Barang berhasil dikembalikan')
  await load()
}

onMounted(load)
</script>
