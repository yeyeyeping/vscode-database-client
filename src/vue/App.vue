<template>
  <router-view></router-view>
</template>

<script>
import { getVscodeEvent } from "./util/vscode"

const vscodeEvent = getVscodeEvent()

export default {
  name: "App",
  mounted() {
    vscodeEvent.on("route", (path) => {
      if (this.$route.name == path) {
        vscodeEvent.emit("route-" + this.$route.name)
      } else {
        this.$router.push("/" + path)
      }
    }).on("language",language=>{
      this.$i18n.locale = language
    })
    vscodeEvent.emit("init")
  },
  destroyed() {
    vscodeEvent.destroy()
  },
}
</script>
