<template>
 <div class="ges-lock">
   <p class="ges-lock-hint">{{ hint }}<p>
   <div class="ges-lock-pwd">
      <canvas class="design" ref="canvas"></canvas>
      <canvas class="design2" ref="canvas2"></canvas>
   </div>
 </div>
</template>
<script>
// import Debounce from '@mucfc.com/services/debounce';

export default {
  data() {
    return {
      devicePixelRatio: 1,
      totolPoint: [], // 所有圆圈
      lastPoint: [], // 已使用的圆圈
      restPoint: [], // 剩下的圆圈
      touchFlag: false, // 标记是否绘制中
      canvas: '',
      canvas2: '',
      ctx: '',
      ctx2: '',
      r: 0, // 圆的半径
      pwd: '',
      step: 1, // 当前步骤
      reDraw: false // 是否需要重绘
    };
  },
  mounted() {
    this.init();
  },
  computed: {
    hint() {
      if (this.hasPwd) {
        return '请输入手势密码';
      }
      return this.step === 1 ? '请绘制图案' : '请再次绘制相同的图案';
    }
  },
  methods: {
    init() {
      this.initDesign();
      this.touchFlag = false;
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.canvas2 = this.$refs.canvas2;
      this.ctx2 = this.canvas2.getContext('2d');
      this.ctx2.strokeStyle = this.rightColor;
      this.createCircle();
      this.bindEvent();
    },
    initDesign() {
      this.devicePixelRatio = window.devicePixelRatio || 1;
      this.$refs.canvas.height = 320 * this.devicePixelRatio;
      this.$refs.canvas.width = 320 * this.devicePixelRatio;
      this.$refs.canvas2.width = 320 * this.devicePixelRatio;
      this.$refs.canvas2.height = 320 * this.devicePixelRatio;
    },
    bindEvent() {
      this.canvas2.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const pos = this.getPosition(e);
        this.judgePos(pos);
      }, false);
      // 节流函数
      const throttle = this.throttle((e) => {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        if (this.touchFlag) {
          this.update(this.getPosition(e));
        } else {
          const pos = this.getPosition(e);
          this.judgePos(pos);
        }
      }, 16);
      this.canvas2.addEventListener('touchmove', throttle, false);
      this.canvas2.addEventListener('touchend', async () => {
        if (this.touchFlag) {
          this.touchFlag = false;
          // 执行回调函数
          await this.onDrawEnd(this.lastPoint);
          this.ctx2.clearRect(0, 0, this.canvas.width, this.canvas.width);
          this.lastPoint = [];
          this.restPoint = [];
          setTimeout(() => {
            this.createCircle();
          }, 500);
        }
      }, false);
    },
    /**
     * 更新绘图
    */
    update(pos) {
      this.judgePos(pos);
      this.drawLine2TouchPos(pos);
      if (this.reDraw) {
        this.reDraw = false;
        this.drawPoint(this.rightColor);
        this.drawLine(this.rightColor, pos);
      }
    },
    /**
     * 绘制线
    */
    drawLine2TouchPos(pos) {
      const len = this.lastPoint.length;
      if (len >= 1) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height); // 先清空
        this.ctx2.beginPath();
        this.ctx2.strokeStyle = this.rightColor;
        this.ctx2.lineWidth = 3;
        this.ctx2.moveTo(this.lastPoint[len - 1].x, this.lastPoint[len - 1].y);
        this.ctx2.lineTo(pos.x, pos.y);
        this.ctx2.stroke();
        this.ctx2.closePath();
      }
    },
    /**
     * 构建每一个点的坐标
    */
    createCircle() {
      this.r = this.ctx.canvas.width / 14; // 3 * 4 + 2 = 14
      this.lastPoint = [];
      this.totalPoint = [];
      this.restPoint = [];
      const r = this.r;
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          const obj = {
            x: (4 * j * r) + (3 * r),
            y: (4 * i * r) + (3 * r),
            index: (i * 3) + j + 1
          };
          this.totalPoint.push(obj);
          this.restPoint.push(obj);
        }
      }
      this.drawCircles();
    },
    /**
     * 绘制圈圈
    */
    drawCircles() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.totalPoint.forEach((item) => {
        this.drawCircle(item.x, item.y, '#87888a');
      });
    },
    /**
     * 结束时重新绘制已绘制的圈
    */
    drawEndCircles(color) {
      this.lastPoint.forEach((point) => {
        this.drawCircle(point.x, point.y, color);
      });
    },
    /**
     * 根据坐标绘制圆
    */
    drawCircle(x, y, color) {
      this.ctx.strokeStyle = color;// 圆圈的颜色
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    /**
     * 绘制点亮的中心点
    */
    drawPoint(style) {
      this.lastPoint.forEach((item) => {
        this.ctx.fillStyle = style;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, this.r / 2.5, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      });
    },
    /**
     * 获取用户触发点击时的坐标
     * @param {Object} e 触碰元素
    */
    getPosition(e) {
      const rect = e.target.getBoundingClientRect();
      const pos = {
        x: (e.touches[0].clientX - rect.left) * this.devicePixelRatio,
        y: (e.touches[0].clientY - rect.top) * this.devicePixelRatio
      };
      return pos;
    },
    /**
     * 判断是否再某一圆圈内
     * @param {Object} pos 位置信息
    */
    judgePos(pos) {
      for (let i = 0; i < this.restPoint.length; i += 1) {
        if (Math.abs(pos.x - this.restPoint[i].x) < this.r
        && Math.abs(pos.y - this.restPoint[i].y) < this.r) {
          // this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
          this.lastPoint.push(this.restPoint[i]);
          this.restPoint.splice(i, 1);
          this.touchFlag = true;
          this.reDraw = true;
          break;
        }
      }
    },
    /**
     * 绘制点亮的圆圈的颜色
    */
    drawStatusPoint(style) {
      this.lastPoint.forEach((point) => {
        this.drawCircle(point.x, point.y, style);
      });
    },
    /**
     * 密码轨迹
    */
    drawLine() {
      const len = this.lastPoint.length;
      if (len >= 2) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.rightColor;
        this.ctx.moveTo(this.lastPoint[len - 2].x, this.lastPoint[len - 2].y);
        this.ctx.lineTo(this.lastPoint[len - 1].x, this.lastPoint[len - 1].y);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    },
    /**
     * 密码轨迹
    */
    drawEndLine(style) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = style;
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
      for (let i = 1; i < this.lastPoint.length; i += 1) {
        this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    },
    /**
     * 绘制结束
    */
    async onDrawEnd(lastPoint) {
      const pwd = lastPoint.map(item => item.index).join('');
      this.$emit('on-end', pwd);
      if (pwd.length < this.minLength) {
        this.onError('less');
        return;
      }
      if (this.hasPwd === true) {
        const isSuccess = await this.validatePwd(pwd);
        if (!isSuccess) {
          this.onError('errorValidate');
        } else {
          this.$emit('on-validate-success', pwd);
        }
        return;
      }
      if (this.step === 1) {
        this.pwd = pwd;
        this.step = 2;
      } else if (pwd === this.pwd) {
        this.$emit('on-set-success', pwd);
      } else {
        this.onError('errorConfirm');
      }
    },
    /**
     * 失败的函数
    */
    onError(type) {
      switch (type) {
        case 'less':
          this.$toast(`请连接至少${this.minLength}个点`);
          break;
        case 'errorConfirm':
          this.$toast('两次手势密码不一致，请重新绘制');
          break;
        case 'errorValidate':
          this.$toast('解锁错误，请重新解锁');
          break;
        default:
          this.$toast('解锁错误，请重新解锁');
          break;
      }
      this.drawEndCircles(this.errorColor);
      this.drawPoint(this.errorColor);
      this.drawEndLine(this.errorColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);
    },
    /**
     * 节流函数
    */
    throttle(func, delay) {
      let timer;
      let startTime = new Date();
      const self = this;
      const throttleFunc = (...args) => {
        const curTime = new Date();
        clearTimeout(timer);
        if (curTime - startTime >= delay) {
          startTime = curTime;
          func.apply(self, args);
        } else {
          timer = setTimeout(() => {
            func.apply(self, args);
          }, delay);
        }
      };
      return throttleFunc;
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    minLength: {
      type: Number,
      default: 6
    },
    /**
     * 是否有密码，默认为只抛出作，若传入没有，则会进入设置流程，即输入两次
    */
    hasPwd: {
      type: Boolean,
      default: true
    },
    /**
     * 校验密码是否正确，非设置密码时必传，组件只做绘图抛出密码用，函数需要返回验证是否正确
    */
    validatePwd: {
      type: Function,
    },
    /**
     * 成功的颜色
    */
    rightColor: {
      type: String,
      default: '#3880E0'
    },
    /**
     * 错误的颜色
    */
    errorColor: {
      type: String,
      default: '#E64340',
    }
  }
};
</script>
<style lang="less">
.ges-lock {
  width: 100%;
  &-hint {
    text-align: center;
    margin-top: 40px;
  }
  position: relative;
  text-align: center;
  &-pwd {
    width: 320px;
    height: 320px;
    margin: auto auto;
    position: relative;
    .design {
      width: 320px;
      height: 320px;
    }
    .design2 {
      width: 320px;
      height: 320px;
      left: 0;
      top: 0;
      position: absolute;
    }
  }
}
</style>
