<!--
 * @Descripttion:
 * @Author: zhangchong zc16607@gmail.com
 * @Date: 2022-12-29 16:14:15
 * @LastEditors: zhangchong zc16607@gmail.com
 * @LastEditTime: 2023-05-22 16:13:14
-->

<template>
  <router-view v-slot="{ Component }">
    <component v-if="this.$route.name === 'tabBar'" :is="Component" />
    <transition
      v-else
      enter-active-class="motion-safe:transition-opacity-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="motion-safe:transition-opacity-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
</script>
