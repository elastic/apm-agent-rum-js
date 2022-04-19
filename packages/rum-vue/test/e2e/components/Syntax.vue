<script setup>
  import { inject } from 'vue'
  const isScriptSetupSyntaxSupported = inject('$apm') ? true : false
</script>

<template>
    <div>
        Is vue 3 script setup syntax support working properly?
        <div id="script-setup-syntax-support">{{isScriptSetupSyntaxSupported}}</div>
    </div>
</template>
