<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="p-3 rounded-full bg-blue-100 text-primary mr-4">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Total Students</p>
          <p class="text-2xl font-semibold text-gray-800">1,250</p>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Total Teachers</p>
          <p class="text-2xl font-semibold text-gray-800">84</p>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Total Classes</p>
          <p class="text-2xl font-semibold text-gray-800">36</p>
        </div>
      </div>
      
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Active Sessions</p>
          <p class="text-2xl font-semibold text-gray-800">12</p>
        </div>
      </div>

    </div>

    <!-- Recent Activity Placeholder -->
    <div class="glass p-6 rounded-xl shadow-sm">
      <h3 class="text-lg font-medium text-gray-800 mb-4 border-b border-gray-100 pb-2">Recent Activity</h3>
      <div class="space-y-4">
        <!-- Mock Data -->
        <div class="flex items-center text-sm">
          <div class="w-2 h-2 rounded-full bg-primary mr-3"></div>
          <span class="text-gray-500 w-32">10 mins ago</span>
          <span class="text-gray-800">Admin added a new student record</span>
        </div>
        <div class="flex items-center text-sm">
          <div class="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
          <span class="text-gray-500 w-32">1 hr ago</span>
          <span class="text-gray-800">Teacher completed grade entry for Class 10A</span>
        </div>
        <div class="flex items-center text-sm">
          <div class="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
          <span class="text-gray-500 w-32">3 hrs ago</span>
          <span class="text-gray-800">System backup completed successfully</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Dashboard logic
</script>
