<template>
  <q-item>
    <q-item-section avatar>
      <q-icon name="mdi-circle" :color="statusColor"></q-icon>
    </q-item-section>
    <q-item-section>
      <q-item-label overline>{{ user.role }}</q-item-label>
      <q-item-label>{{ user.nickName }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState } from "pinia";
import useUser from "src/stores/useUser";
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserItem",
  props: {
    user: { type: Object, required: true },
    myRole: { type: String, required: true },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useUser, { me: (store) => store.user }),
    useSetting() {
      switch (this.myRole) {
        case "Master": // 내가 마스터야 → 나만 빼고 다~~
          return this.me.id != this.user.userId;
        case "Manager": // 내가 매니저야 → 일반유저, 블럭유저 가능
          return this.user.role == "User" || this.user.role == "Block";
        default:
          return false;
      }
    },
    status() {
      if (this.user.role == "Block") {
        return "block";
      } else if (this.user.connected) {
        return "online";
      } else {
        return "offline";
      }
    },
    statusColor() {
      switch (this.status) {
        case "block":
          return "red";
        case "online":
          return "green";
        case "offline":
          return "grey";
      }
    },
  },
  methods: {
    userSetting() {
      console.log(this.user);
    },
  },
});
</script>

<style lang='scss' scoped>
</style>
