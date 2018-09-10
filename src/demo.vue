<template>
<div>
  <ges-lock
    :step="1"
    :validatePwd="validatePwd"
    @on-set-success="onSetSuccess"
    @on-end="onEnd"
    :hasPwd="hasPwd">
  </ges-lock>
  <p>{{ drawPwd }}</p>
</div>
</template>

<script>
import GesLock from './components/ges-lock.vue';

export default {
  name: 'ges-lock-demo',
  components: {
    GesLock
  },
  data() {
    return {
      pwd: '',
      hasPwd: false,
      drawPwd: '',
    };
  },
  methods: {
    validatePwd(pwd) {
      if (pwd === this.pwd) {
        this.$toast('解锁成功');
        return true;
      }
      return false;
    },
    onEnd(pwd) {
      this.drawPwd = pwd;
    },
    onSetSuccess(pwd) {
      this.$toast(`设置成功,${pwd}`);
      this.pwd = pwd;
      this.hasPwd = true;
    }
  }
};
</script>
<style lang="less">
p {
  text-align: center;
}
</style>

